import type { AgentContext } from '../../../../agent'
import type { Query } from '../../../../storage/StorageService'
import type { W3cCredentialRecord } from '../../../vc'
import type { PresentationSignCallBackParams, PresentationSignOptions, SubmissionRequirementMatch } from '@sphereon/pex'
import type { PresentationDefinitionV1 } from '@sphereon/pex-models'
import type { IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types'

import { PEXv1, Status } from '@sphereon/pex'
import { Rules } from '@sphereon/pex-models'
import { IProofPurpose } from '@sphereon/ssi-types'
import { default as jp } from 'jsonpath'

import { AriesFrameworkError } from '../../../../error'
import { JsonTransformer } from '../../../../utils'
import { DidResolverService } from '../../../dids'
import { W3cVerifiablePresentation, W3cPresentation, W3cCredentialService } from '../../../vc'

export class PresentationExchangeService {
  private pex = new PEXv1()

  public validateDefinition(presentationDefinition: PresentationDefinitionV1) {
    const result = this.pex.validateDefinition(presentationDefinition)

    // check if error
    const firstResult = Array.isArray(result) ? result[0] : result

    if (firstResult.status !== Status.INFO) {
      throw new AriesFrameworkError(`Error in presentation exchange presentationDefinition: ${firstResult.message} `)
    }
  }

  public evaluatePresentation(
    agentContext: AgentContext,
    {
      presentationDefinition,
      presentation,
    }: { presentationDefinition: PresentationDefinitionV1; presentation: IVerifiablePresentation }
  ) {
    // validate contents of presentation
    const evaluationResults = this.pex.evaluatePresentation(presentationDefinition, presentation)

    return evaluationResults
  }

  public async getCredentialsForRequest(agentContext: AgentContext, presentationDefinition: PresentationDefinitionV1) {
    const w3cCredentialService = agentContext.dependencyManager.resolve(W3cCredentialService)

    const query: Array<Query<W3cCredentialRecord>> = []

    // The schema.uri can contain either an expanded type, or a context uri
    for (const inputDescriptor of presentationDefinition.input_descriptors) {
      for (const schema of inputDescriptor.schema) {
        query.push({
          $or: [{ expandedType: [schema.uri] }, { contexts: [schema.uri] }],
        })
      }
    }

    // query the wallet ourselves first to avoid the need to query the pex library for all
    // credentials for every proof request
    const credentials = await w3cCredentialService.findCredentialsByQuery(agentContext, {
      $or: query,
    })

    const pexCredentials = credentials.map((c) => JsonTransformer.toJSON(c) as IVerifiableCredential)
    console.log(
      JSON.stringify(
        {
          presentationDefinition,
          credentials: pexCredentials,
        },
        null,
        2
      )
    )
    const selectResults = this.pex.selectFrom(presentationDefinition, pexCredentials)

    console.log(selectResults)
    if (selectResults.areRequiredCredentialsPresent === Status.ERROR) {
      throw new AriesFrameworkError(`No matching credentials found: ${selectResults.errors?.['0'].message}`)
    }

    return selectResults
  }

  public async selectCredentialsForRequest(
    agentContext: AgentContext,
    presentationDefinition: PresentationDefinitionV1
  ) {
    const credentialsForRequest = await this.getCredentialsForRequest(agentContext, presentationDefinition)

    if (!credentialsForRequest.matches || !credentialsForRequest.verifiableCredential) {
      throw new AriesFrameworkError('No matches found for presentation request')
    }

    const foundMatches: string[] = []
    const selectedCredentials: IVerifiableCredential[] = []

    for (const match of credentialsForRequest.matches) {
      // FIXME: when is name undefined?
      if (!match.name) {
        throw new AriesFrameworkError('Unsupported flow. no name on the match')
      }

      // If the foundMatches already includes this match, we don't want to pick it again
      if (foundMatches.includes(match.name)) continue

      // Add to the found matches
      foundMatches.push(match.name)

      // Extract the credentials from this match
      const credentialsForMatch = this.retrieveSelectedCredentials(match, credentialsForRequest.verifiableCredential)
      selectedCredentials.push(...credentialsForMatch)
    }

    return selectedCredentials
  }

  public async createPresentation(
    agentContext: AgentContext,
    {
      selectedCredentials,
      presentationDefinition,
      challenge,
      domain,
    }: {
      selectedCredentials: IVerifiableCredential[]
      presentationDefinition: PresentationDefinitionV1
      challenge?: string
      domain?: string
    }
  ) {
    const didResolverService = agentContext.dependencyManager.resolve(DidResolverService)
    const w3cCredentialService = agentContext.dependencyManager.resolve(W3cCredentialService)

    // We use the subject id to resolve the DID document.
    // I am assuming the subject is the same for all credentials (for now)
    // The presentation contains multiple credentials and these are being added
    // TODO how do we derive the verification method if there are multiple subject Ids
    const firstSubjectId = selectedCredentials[0].credentialSubject.id

    // Credential is allowed to be presented without a subject id. In that case we can't prove ownership of credential
    // And it is more like a bearer token.
    // In the future we can first check the holder key and if it exists we can use that as the one that should authenticate
    // https://www.w3.org/TR/vc-data-model/#example-a-credential-issued-to-a-holder-who-is-not-the-only-subject-of-the-credential-who-has-no-relationship-with-the-subject-of-the-credential-but-who-has-a-relationship-with-the-issuer
    if (!firstSubjectId) {
      throw new AriesFrameworkError(
        'Credential subject missing from the selected credential for creating presentation.'
      )
    }

    if (!firstSubjectId.startsWith('did:')) {
      throw new AriesFrameworkError(
        `Only dids are supported as credentialSubject id. ${firstSubjectId} is not a valid did`
      )
    }

    const didDocument = await didResolverService.resolveDidDocument(agentContext, firstSubjectId)
    if (!didDocument.authentication || didDocument.authentication.length === 0) {
      throw new AriesFrameworkError(
        `No authentication verificationMethods found for did ${firstSubjectId} in did document`
      )
    }

    // the signature suite to use for the presentation is dependant on the credentials we share.
    // 1. Get the verification method for this given proof purpose in this DID document
    let [verificationMethod] = didDocument.authentication
    if (typeof verificationMethod === 'string') {
      verificationMethod = didDocument.dereferenceKey(verificationMethod, ['authentication'])
    }

    const proofType = w3cCredentialService.getProofTypeByVerificationMethodType(verificationMethod.type)

    // Q1: is holder always subject id, what if there are multiple subjects???
    // Q2: What about proofType, proofPurpose verification method for multiple subjects?
    const params = {
      holder: firstSubjectId,
      proofOptions: {
        type: proofType,
        proofPurpose: IProofPurpose.authentication,
        challenge,
        domain,
      },
      signatureOptions: {
        verificationMethod: verificationMethod.id,
      },
    } satisfies PresentationSignOptions

    const verifiablePresentation = await this.pex.verifiablePresentationFromAsync(
      presentationDefinition,
      selectedCredentials.map((c) => JsonTransformer.toJSON(c) as IVerifiableCredential),
      // FIXME: pex library has incorrect return type for the PEXv1 class
      // remove ts-ignore when https://github.com/Sphereon-Opensource/PEX/pull/108 is released
      // @ts-ignore
      this.signPresentationCallbackWithAgentContext(agentContext),
      params
    )

    return JsonTransformer.fromJSON(verifiablePresentation, W3cVerifiablePresentation)
  }

  private signPresentationCallbackWithAgentContext = (agentContext: AgentContext) => {
    const w3cCredentialService = agentContext.dependencyManager.resolve(W3cCredentialService)

    return async (callBackParams: PresentationSignCallBackParams) => {
      // The created partial proof and presentation, as well as original supplied options
      const { presentation: presentationJson, proof, options } = callBackParams

      // extract the originally supplied signature and proof Options
      const { signatureOptions, proofOptions } = options

      if (!proofOptions?.type) {
        throw new AriesFrameworkError('Missing proof type in proof options for signing the presentation.')
      }

      if (!proofOptions?.challenge) {
        throw new AriesFrameworkError('Missing challenge in proof options for signing the presentation.')
      }

      if (!signatureOptions?.verificationMethod) {
        throw new AriesFrameworkError('Missing verification method in proof options for signing the presentation.')
      }

      const presentation = JsonTransformer.fromJSON(presentationJson, W3cPresentation)

      const signedPresentation = await w3cCredentialService.signPresentation(agentContext, {
        presentation,
        purpose: proof.proofPurpose,
        signatureType: proofOptions.type,
        verificationMethod: signatureOptions.verificationMethod,
        challenge: proofOptions.challenge,
      })

      return JsonTransformer.toJSON(signedPresentation) as IVerifiablePresentation
    }
  }

  private retrieveSelectedCredentials(
    match: SubmissionRequirementMatch,
    credentials: IVerifiableCredential[]
  ): IVerifiableCredential[] {
    if (match.rule === Rules.All) {
      return this.ruleAll(match, credentials)
    } else if (match.rule === Rules.Pick) {
      return this.rulePick(match, credentials)
    }

    throw new AriesFrameworkError(`Unsupported rule: ${match.rule}`)
  }

  private ruleAll(match: SubmissionRequirementMatch, credentials: IVerifiableCredential[]): IVerifiableCredential[] {
    const selectedCredentials: IVerifiableCredential[] = []

    // Simple (no submission requirements) match
    if (!match.from && !match.from_nested && !match.count && !match.max && !match.min) {
      for (const path of match.vc_path) {
        const result = jp.query({ verifiableCredential: credentials }, path)
        selectedCredentials.push(...result)
      }

      return selectedCredentials
    }

    // Submission requirements match

    // extract all verifiable credentials for the given match (expressed as a jsonpath)
    // from the the full list of credentials
    // nested query: loop through all sub objects recursively adding to the results array
    // for (let nestedMatchIndex = 0; nestedMatchIndex < match.from_nested.length; nestedMatchIndex++) {
    //   selectedCredentials.push(...this.retrieveSelectedCredentials(match.from_nested[nestedMatchIndex], credentials))
    // }

    return selectedCredentials
  }

  private rulePick(match: SubmissionRequirementMatch, credentials: IVerifiableCredential[]): IVerifiableCredential[] {
    const selectedCredentials: IVerifiableCredential[] = []

    if (!match.count) {
      throw new AriesFrameworkError(`PeX Library missing match count`)
    }

    for (let matchIndex = 0; matchIndex < match.count; matchIndex++) {
      // extract [count] verifiable credentials for the given match (expressed as a jsonpath)
      // from the the full list of credentials

      // if we have nested credentials (from_nested is defined) use count as number
      // of recursive calls
      if (match.from_nested) {
        selectedCredentials.push(...this.retrieveSelectedCredentials(match.from_nested[matchIndex], credentials))
      } else {
        selectedCredentials.push(...jp.query(credentials, match.vc_path[matchIndex]))
      }
    }

    return selectedCredentials
  }
}
