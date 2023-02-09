import type { ProofFormat } from '../ProofFormat'
import type { SelectResults } from '@sphereon/pex'
import type { PresentationDefinitionV1 } from '@sphereon/pex-models'
import type { IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types'

export interface PresentationExchangeProposeProofFormat {
  inputDescriptors: PresentationDefinitionV1['input_descriptors']
}

export interface PresentationExchangeAcceptProposalFormat {
  options?: {
    challenge?: string
    domain?: string
  }
}

export interface PresentationExchangeRequestProofFormat {
  options?: {
    challenge?: string
    domain?: string
  }
  presentationDefinition: PresentationDefinitionV1
}

export interface PresentationExchangeAcceptProofRequestFormat {
  credentials?: IVerifiableCredential[]
}

export interface PresentationExchangeProposalData {
  input_descriptors: PresentationDefinitionV1['input_descriptors']
}

export interface PresentationExchangeRequestData {
  options: {
    challenge?: string
    domain?: string
  }
  presentationDefinition: PresentationDefinitionV1
}

export interface PresentationExchangeProofFormat extends ProofFormat {
  formatKey: 'presentationExchange'

  proofFormats: {
    createProposal: PresentationExchangeProposeProofFormat
    acceptProposal: PresentationExchangeAcceptProposalFormat
    createRequest: PresentationExchangeRequestProofFormat
    acceptRequest: PresentationExchangeAcceptProofRequestFormat

    getCredentialsForRequest: {
      input: Record<string, never> // empty object
      output: SelectResults
    }
    selectCredentialsForRequest: {
      input: Record<string, never> // empty object
      output: {
        credentials: IVerifiableCredential[]
      }
    }
  }

  formatData: {
    proposal: PresentationExchangeProposalData
    request: PresentationExchangeRequestData
    presentation: IVerifiablePresentation
  }
}
