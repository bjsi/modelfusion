import { ChatPrompt } from "../../../model-function/generate-text/ChatPrompt.js";
import { InstructionPrompt } from "../../../model-function/generate-text/InstructionPrompt.js";
import { TextGenerationPromptFormat } from "../../../model-function/generate-text/TextGenerationPromptFormat.js";
import { validateChatPrompt } from "../../../model-function/generate-text/validateChatPrompt.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";

/**
 * Formats an instruction prompt as an OpenAI chat prompt.
 */
export function mapInstructionPromptToOpenAIChatFormat(): TextGenerationPromptFormat<
  InstructionPrompt,
  Array<OpenAIChatMessage>
> {
  return {
    format: (instruction) => {
      const messages: Array<OpenAIChatMessage> = [];

      if (instruction.system != null) {
        messages.push({
          role: "system",
          content: instruction.system,
        });
      }

      messages.push({
        role: "user",
        content: instruction.instruction,
      });

      if (instruction.input != null) {
        messages.push({
          role: "user",
          content: instruction.input,
        });
      }

      return messages;
    },
    stopSequences: [],
  };
}

/**
 * Formats a chat prompt as an OpenAI chat prompt.
 */
export function mapChatPromptToOpenAIChatFormat(): TextGenerationPromptFormat<
  ChatPrompt,
  Array<OpenAIChatMessage>
> {
  return {
    format: (chatPrompt) => {
      validateChatPrompt(chatPrompt);

      const messages: Array<OpenAIChatMessage> = [];

      for (let i = 0; i < chatPrompt.length; i++) {
        const message = chatPrompt[i];

        // system message:
        if (
          i === 0 &&
          "system" in message &&
          typeof message.system === "string"
        ) {
          messages.push({
            role: "system",
            content: message.system,
          });

          continue;
        }

        // user message
        if ("user" in message) {
          messages.push({
            role: "user",
            content: message.user,
          });

          continue;
        }

        // ai message:
        if ("ai" in message) {
          messages.push({
            role: "assistant",
            content: message.ai,
          });

          continue;
        }

        // unsupported message:
        throw new Error(`Unsupported message: ${JSON.stringify(message)}`);
      }

      return messages;
    },
    stopSequences: [],
  };
}
