---
sidebar_position: 15
---

# Tools

Tools enable chatbots and agents to execute actions.
They are the glue that connects them to the outside world.

In ModelFusion, tools are functions with a description and a defined input schema.
Language models can be instructed to use tools by selecting a tool and generating parameters for it.

The tool description and the text description in the zod schema (as well as the names in the schema) are used as part of the prompt.
Relevant names and descriptions can help the language model to understand the schema and enter the correct data.

## Creating Tools

You can create the tools that you need for yor application by using the [Tool class](/api/classes/Tool).

### Tool class

[Tool API](/api/classes/Tool)

```ts
const calculator = new Tool({
  name: "calculator",
  description: "Execute a calculation",

  inputSchema: new ZodSchema(
    z.object({
      a: z.number().describe("The first number."),
      b: z.number().describe("The second number."),
      operator: z
        .enum(["+", "-", "*", "/"])
        .describe("The operator (+, -, *, /)."),
    })
  ),
  execute: async ({ a, b, operator }) => {
    switch (operator) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return a / b;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  },
});
```

## Using Tools

### useTool

[useTool API](/api/modules/#useTool)

`useTool` uses [generateStructure](/guide/function/generate-structure) to generate parameters for a tool and then executes the tool with the parameters.

The result contains the name of the tool (`tool` property), the parameters (`parameters` property, typed), and the result of the tool execution (`result` property, typed).

```ts
const { tool, parameters, result } = await useTool(
  new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
  calculator,
  [OpenAIChatMessage.user("What's fourteen times twelve?")]
);
```

### useToolOrGenerateText

[useToolOrGenerateText API](/api/modules/#useToolorgeneratetext)

`useToolOrGenerateText` uses [generateStructureOrText](/guide/function/generate-structure-or-text)
to select a tool, generate parameters for it and execute it.
It can be configured with several tools.

```ts
const { tool, parameters, result, text } = await useToolOrGenerateText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
  [calculator /* ... */],
  [OpenAIChatMessage.user("What's fourteen times twelve?")]
);
```

If you need more control of the prompt, e.g. to reduce errors, you can access the tools in the prompt generation:

```ts
const { tool, parameters, result, text } = await useToolOrGenerateText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
  [calculator /* ... */],
  // Instead of using a curried function,
  // you can also work with the tools directly:
  (tools) => [
    OpenAIChatMessage.system(
      // Here the available tools are used to create
      // a more precise prompt that reduces errors:
      `You have ${tools.length} tools available (${tools
        .map((tool) => tool.name)
        .join(", ")}).`
    ),
    OpenAIChatMessage.user("What's fourteen times twelve?"),
    // OpenAIChatMessage.user("What's twelwe plus 1234?"),
    // OpenAIChatMessage.user("Tell me about Berlin"),
  ]
);
```

The result contains:

- `tool`: the name of the tool or `null` if text was generated
- `parameters`: the parameters (typed) or `null` if text was generated
- `result`: the result of the tool execution (typed) or `null` if text was generated
- `text`: the generated text. Optional if a tool was selected.

```ts
console.log(tool != null ? `TOOL: ${tool}` : "TEXT");
console.log(`PARAMETERS: ${JSON.stringify(parameters)}`);
console.log(`TEXT: ${text}`);
console.log(`RESULT: ${JSON.stringify(result)}`);
```

### executeTool

[executeTool API](/api/modules/#executetool)

`executeTool` directly executes a tool with the given parameters.
It also records the runtime and handles errors.
`executeTool` is used by `useTool` and `useToolOrGenerateText`.

#### Basic Example

```ts
const result = await executeTool(calculator, {
  operator: "*" as const,
  a: 14,
  b: 12,
});
```

#### With full response

```ts
const { metadata, output } = await executeTool(calculator, {
  operator: "*" as const,
  a: 14,
  b: 12,
}).asFullResponse();
```

## Pre-defined Tools

The following tools are available as a separate packages:

- [SerpAPI websearch](/integration/tool/serpapi)
- [Google Custom Search](/integration/tool/google-custom-search)

## Demo Apps

### [Middle school math](https://github.com/lgrammel/modelfusion/tree/main/examples/middle-school-math-agent)

> _terminal app_, _agent_, _tools_, _GPT-4_

Small agent that solves middle school math problems. It uses a calculator tool to solve the problems.

### [Wikipedia Agent](https://github.com/lgrammel/modelfusion/tree/main/examples/wikipedia-agent)

> _terminal app_, _ReAct agent_, _GPT-4_, _OpenAI functions_, _tools_

Get answers to questions from Wikipedia, e.g. "Who was born first, Einstein or Picasso?"
