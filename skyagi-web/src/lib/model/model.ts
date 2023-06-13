import { OpenAI } from "langchain";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export enum ModelProvider {
    OpenAI = 'OpenAI'
}

export enum LLMType {
    ChatOpenAI = 'ChatOpenAI',
    OpenAI = 'OpenAI'
}

export enum EmbeddingType {
    OpenAIEmbeddings = 'OpenAIEmbeddings'
}

export interface LLMSettings {
    type: LLMType;
    provider: ModelProvider;
    name: string;
    args: { [k: string]: unknown };
    credentials: { [k: string]: unknown };
}

export interface EmbeddingSettings {
    type: EmbeddingType;
    provider: ModelProvider;
    name: string;
    args: { [k: string]: unknown };
    credentials: { [k: string]: unknown };
    embeddingSize: number;
}

export interface ProviderTemplate {
    provider: ModelProvider;
    models: {
        llms: LLMSettings[];
        embeddings: EmbeddingSettings[];
    };
}


// LLM/Chat models registry
export const llm_type_to_cls_dict = {
    [LLMType.ChatOpenAI]: ChatOpenAI,
    [LLMType.OpenAI]: OpenAI,
};

// Embedding models registry
export const embedding_type_to_cls_dict = {
    [EmbeddingType.OpenAIEmbeddings]: OpenAIEmbeddings,
};


export const providerTemplates: {
    [provider: string]: ProviderTemplate
} = {
    [ModelProvider.OpenAI]: {
        provider: ModelProvider.OpenAI,
        models: {
            llms: [
                {
                    type: LLMType.ChatOpenAI,
                    provider: ModelProvider.OpenAI,
                    name: 'openai-gpt-3.5-turbo',
                    credentials: {
                        openAIApiKey: undefined
                    },
                    args: {
                        modelName: 'gpt-3.5-turbo',
                        maxTokens: 1500
                    }
                },
                {
                    // NOTE: GPT4 is in waitlist
                    type: LLMType.ChatOpenAI,
                    provider: ModelProvider.OpenAI,
                    name: 'openai-gpt-4',
                    credentials: {
                        openAIApiKey: undefined
                    },
                    args: {
                        modelName: 'gpt-4',
                        maxTokens: 1500
                    }
                },
                {
                    type: LLMType.OpenAI,
                    provider: ModelProvider.OpenAI,
                    name: 'openai-text-davinci-003',
                    credentials: {
                        openAIApiKey: undefined
                    },
                    args: {
                        modelName: 'text-davinci-003',
                        maxTokens: 1500
                    }
                }
            ],
            embeddings: [
                {
                    type: EmbeddingType.OpenAIEmbeddings,
                    provider: ModelProvider.OpenAI,
                    name: 'openai-text-embedding-ada-002',
                    credentials: {
                        openAIApiKey: undefined
                    },
                    args: {
                        modelName: 'text-embedding-ada-002'
                    },
                    embeddingSize: 1536
                }
            ]
        }
    }
}

export function load_llm_from_config(config: LLMSettings) {
    const config_type = config.type;
    if (!(config_type in llm_type_to_cls_dict)) {
        throw new Error(`Loading ${config_type} type LLM not supported`);
    }

    const cls = llm_type_to_cls_dict[config_type];
    return new cls(config.args);
}

export function load_embedding_from_config(config: EmbeddingSettings) {
    const config_type = config.type;
    if (!(config_type in embedding_type_to_cls_dict)) {
        throw new Error(`Loading ${config_type} type Embedding not supported`);
    }

    const cls = embedding_type_to_cls_dict[config_type];
    return new cls(config.args);
}

// Get all supported LLMs
export function get_all_llms(): string[] {
    const all_llms: string[] = [];
    for (const [provider, template] of Object.entries(providerTemplates)) {
        for (const llm of template.models.llms) {
            all_llms.push(llm.name);
        }
    }
    return all_llms;
}

// Get all supported Embeddings
export function get_all_embeddings(): string[] {
    const all_embeddings: string[] = [];
    for (const [provider, template] of Object.entries(providerTemplates)) {
        for (const embedding of template.models.embeddings) {
            all_embeddings.push(embedding.name);
        }
    }
    return all_embeddings;
}

// Get corresponding LLM's credentials fields
export function get_llm_credentials_fields(modelName: string): string[] {
    for (const [provider, template] of Object.entries(providerTemplates)) {
        for (const llm of template.models.llms) {
            if (modelName === llm.name) {
                return Object.keys(llm.credentials);
            }
        }
    }
    return [];
}

// Get corresponding Embedding's credentials fields
export function get_embedding_credentials_fields(modelName: string): string[] {
    for (const [provider, template] of Object.entries(providerTemplates)) {
        for (const embedding of template.models.embeddings) {
            if (modelName === embedding.name) {
                return Object.keys(embedding.credentials);
            }
        }
    }
    return [];
}