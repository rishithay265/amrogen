# Welcome to Hyperbrowser

Welcome to Hyperbrowser, the Internet for AI. Hyperbrowser is the next-generation platform empowering AI agents and enabling effortless, scalable browser automation. Built specifically for AI developers, it eliminates the headaches of local infrastructure and performance bottlenecks, allowing you to focus entirely on building your solutions, rather getting gummed up on browser problems.

Whether you're training AI agents to navigate the web, collecting data for model fine-tuning, testing applications, or simply scraping data, Hyperbrowser lets you launch and manage browser sessions with ease—no complicated setup required. Our platform provides streamlined solutions for all your web scraping needs, from single-page extraction to comprehensive site crawling.

### Why Developers Choose Hyperbrowser:

* **Instant Scalability** - Deploy hundreds of AI agent browser sessions in seconds without infrastructure complexity
* **Powerful APIs** - Purpose-built APIs for managing sessions, training environments, scraping/crawling sites, using AI Agents, and enhancing AI capabilities
* **Production-Ready AI Infrastructure** - Enterprise-grade reliability and security built specifically for AI workloads
* **Advanced Anti-Bot Protection Bypass** - Built-in stealth mode, ad blocking, automatic CAPTCHA solving, and rotating proxies for uninterrupted AI operation
* **AI-First Design** - Native support for multiple AI frameworks including LangChain, LlamaIndex, MCP, and more

## Jump right in

<table data-view="cards"><thead><tr><th></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><p><span data-gb-custom-inline data-tag="emoji" data-code="1f4d6">📖</span></p><p><strong>Scraping</strong></p></td><td>Scrape a site and get its contents in markdown</td><td></td><td></td><td><a href="get-started/quickstart/web-scraping/scrape">scrape</a></td></tr><tr><td><p><span data-gb-custom-inline data-tag="emoji" data-code="1f577">🕷️</span></p><p><strong>Crawling</strong></p></td><td>Crawl an entire site and all its linked pages</td><td></td><td></td><td><a href="get-started/quickstart/web-scraping/crawl">crawl</a></td></tr><tr><td><p>🔍</p><p>Structured Extraction</p></td><td>Extract site content into structured data</td><td></td><td></td><td><a href="get-started/quickstart/web-scraping/extract">extract</a></td></tr><tr><td><p>🌐</p><p>Browser Use Agent</p></td><td>Have AI do complex tasks with browser-use agent</td><td></td><td></td><td><a href="get-started/quickstart/ai-agents/browser-use">browser-use</a></td></tr><tr><td><p>🧠</p><p>Claude Computer Use</p></td><td>Let Claude handle complex tasks with control of a browser</td><td></td><td></td><td><a href="get-started/quickstart/ai-agents/claude-computer-use">claude-computer-use</a></td></tr><tr><td><p><span data-gb-custom-inline data-tag="emoji" data-code="1f4bb">💻</span></p><p>OpenAI CUA</p></td><td>Let OpenAI's Computer-Using Agent run tasks autonomously in a browser</td><td></td><td></td><td><a href="get-started/quickstart/ai-agents/openai-cua">openai-cua</a></td></tr><tr><td><p><span data-gb-custom-inline data-tag="emoji" data-code="1f468-1f4bb">👨‍💻</span></p><p><strong>Puppeteer</strong></p></td><td>Connect to a browser session with Puppeteer</td><td></td><td></td><td><a href="get-started/quickstart/browser-automation/puppeteer">puppeteer</a></td></tr><tr><td><p><span data-gb-custom-inline data-tag="emoji" data-code="1f3ad">🎭</span></p><p>Playwright</p></td><td>Connect to a browser session with Playwright</td><td></td><td></td><td><a href="get-started/quickstart/browser-automation/playwright">playwright</a></td></tr><tr><td><p>🔧</p><p>Selenium</p></td><td>Connect to a browser session with Selenium</td><td></td><td></td><td><a href="get-started/quickstart/browser-automation/selenium">selenium</a></td></tr></tbody></table>



# Browser Use

Browser Use is an open-source tool designed to make websites accessible for AI agents by enabling them to interact with web pages as a human user would. It provides a framework that allows AI systems to navigate, interpret, and manipulate web content, facilitating tasks such as data extraction, web automation, and testing.

Hyperbrowser's browser-use agent allows you to easily execute agent tasks on the web utilizing browser-use with just a simple call. Hyperbrowser exposes endpoints for starting/stopping a browser-use task and for getting it's status and results.&#x20;

By default, browser-use tasks are handled in an asynchronous manner of first starting the task and then checking it's status until it is completed. However, if you don't want to handle the monitoring yourself, our SDKs provide a simple function that handles the whole flow and returns the data once the task is completed.

## Installation

{% tabs %}
{% tab title="Node" %}

```bash
npm install @hyperbrowser/sdk
```

or

```bash
yarn add @hyperbrowser/sdk
```

{% endtab %}

{% tab title="Python" %}

```bash
pip install hyperbrowser
```

or&#x20;

```bash
uv add hyperbrowser
```

{% endtab %}
{% endtabs %}

## Usage

{% tabs %}
{% tab title="Node" %}

```javascript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const result = await hbClient.agents.browserUse.startAndWait({
    task: "What is the title of the first post on Hacker News today?",
  });

  console.log(`Output:\n\n${result.data?.finalResult}`);
};

main().catch((err) => {
  console.error(`Error: ${err.message}`);
});
```

{% endtab %}

{% tab title="Python" %}

```python
import os
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartBrowserUseTaskParams
from dotenv import load_dotenv

load_dotenv()

hb_client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


def main():
    resp = hb_client.agents.browser_use.start_and_wait(
        StartBrowserUseTaskParams(
            task="What is the title of the first post on HackerNews today?"
        )
    )

    print(f"Output:\n\n{resp.data.final_result}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
```

{% endtab %}

{% tab title="cURL" %}
Start browser-use task

```bash
curl -X POST https://api.hyperbrowser.ai/api/task/browser-use \
    -H 'Content-Type: application/json' \
    -H 'x-api-key: <YOUR_API_KEY>' \
    -d '{
        "task": "go to Hacker News and summarize the top 5 posts of the day"
    }'
```

Get browser-use task status

```bash
curl https://api.hyperbrowser.ai/api/task/browser-use/{jobId}/status \
    -H 'x-api-key: <YOUR_API_KEY>'
```

Get browser-use task

```bash
curl https://api.hyperbrowser.ai/api/task/browser-use/{jobId} \
    -H 'x-api-key: <YOUR_API_KEY>'
```

Stop browser-use task

```bash
curl -X PUT https://api.hyperbrowser.ai/api/task/browser-use/{jobId}/stop \
    -H 'x-api-key: <YOUR_API_KEY>'
```

{% endtab %}
{% endtabs %}

Browser use tasks can be configured with a number of parameters. Some of them are described briefly here, but a list can be found in our [Browser Use API Reference.](https://docs.hyperbrowser.ai/reference/api-reference/agents/browser-use)

<details>

<summary>Browser-Use Task parameters</summary>

* `llm` - The language model (LLM) instance to use for generating actions. By default, Hyperbrowser will use Gemini-2 Flash. A complete list is available in the [Browser Use API Reference](https://docs.hyperbrowser.ai/reference/api-reference/agents/browser-use)

- `sessionId` - An optional existing browser session ID to connect to instead of creating a new one.

* `validateOutput` - When enabled, validates the agent's output format to ensure proper structure.

- `useVision` - When enabled, allows the agent to analyze screenshots of the webpage for better context understanding.

* `useVisionForPlanner` - When enabled, provides screenshots to the planning component of the agent.

- `maxActionsPerStep` - The maximum number of actions the agent can perform in a single step before reassessing.

* `maxInputTokens` - Maximum token limit for inputs sent to the language model, preventing oversized contexts.

- `plannerLlm` - The language model to use specifically for planning future actions, can differ from the main LLM. By default, Hyperbrowser will use Gemini-2 Flash

* `pageExtractionLlm` - The language model to use for extracting structured data from webpages. By default, Hyperbrowser will use Gemini-2 Flash

- `plannerInterval` - How often the planner runs (measured in agent steps) to reassess the overall strategy.

* `maxSteps` - The maximum number of steps the agent can take before concluding the task.
* `maxFailures` - The maximum number of failures allowed before the task is aborted.
* `initialActions` - List of initial actions to run before the main task.

- `keepBrowserOpen` - When enabled, keeps the browser session open after task completion.

* `sessionOptions` - [Options for the session](#session-configurations).
* `useCustomApiKeys` - When enabled, the API Keys provided by the user will be used to execute the agent task. No credits will be used for the Agent task itself if user provided keys are used, but the browser usage credits will still be charged for browser hours and proxy data.
* `apiKeys` - Object with optional API Keys for openai, anthropic, and google.

</details>

{% hint style="info" %}
For detailed usage/schema, check out the [Browser Use API Reference](https://docs.hyperbrowser.ai/reference/api-reference/agents/browser-use).
{% endhint %}

{% hint style="info" %}
The agent may not complete the task within the specified `maxSteps`. If that happens, try increasing the `maxSteps` parameter.

Additionally, the browser session used by the AI Agent will time out based on your team's default **Session Timeout** settings or the session's `timeoutMinutes` parameter if provided. You can adjust the default Session Timeout in the [Settings page](https://app.hyperbrowser.ai/settings).&#x20;
{% endhint %}

## Reuse Browser Session

You can pass in an existing `sessionId` to the Browser Use task so that it can execute the task on an existing session. Also, if you want to keep the session open after executing the task, you can supply the `keepBrowserOpen` param.

{% hint style="info" %}
In the examples below, the `keepBrowserOpen` field is not set to true in the second call to the AI Agent so it will close the browser session after execution, and the session is being closed at the end with the `stop` function to make sure it gets closed.
{% endhint %}

{% tabs %}
{% tab title="Node" %}

```typescript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const session = await hbClient.sessions.create();

  try {
    const result = await hbClient.agents.browserUse.startAndWait({
      task: "What is the title of the first post on Hacker News today?",
      sessionId: session.id,
      keepBrowserOpen: true,
    });

    console.log(`Output:\n${result.data?.finalResult}`);

    const result2 = await hbClient.agents.browserUse.startAndWait({
      task: "Tell me how many upvotes the first post has.",
      sessionId: session.id,
    });

    console.log(`\nOutput:\n${result2.data?.finalResult}`);
  } catch (err) {
    console.error(`Error: ${err}`);
  } finally {
    await hbClient.sessions.stop(session.id);
  }
};

main().catch((err) => {
  console.error(`Error: ${err.message}`);
});

```

{% endtab %}

{% tab title="Python" %}

```python
import os
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartBrowserUseTaskParams
from dotenv import load_dotenv

load_dotenv()

hb_client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


def main():
    session = hb_client.sessions.create()

    try:
        resp = hb_client.agents.browser_use.start_and_wait(
            StartBrowserUseTaskParams(
                task="What is the title of the first post on Hacker News today?",
                session_id=session.id,
                keep_browser_open=True,
            )
        )

        print(f"Output:\n{resp.data.final_result}")

        resp2 = hb_client.agents.browser_use.start_and_wait(
            StartBrowserUseTaskParams(
                task="Tell me how many upvotes the first post has.",
                session_id=session.id,
            )
        )

        print(f"\nOutput:\n{resp2.data.final_result}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        hb_client.sessions.stop(session.id)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")

```

{% endtab %}
{% endtabs %}

## Use Your Own API Keys

You can provide your own API Keys to the Browser Use task so that it doesn't charge credits to your Hyperbrowser account for the steps it takes during execution. Only the credits for the [usage of the browser itself](https://docs.hyperbrowser.ai/reference/pricing#browser-sessions) will be charged. Depending on which model you select for the `llm`, `plannerLlm`, and `pageExtractionLlm`, the API keys from those providers will need to be provided when `useCustomApiKeys` is set to true.

{% tabs %}
{% tab title="Node" %}

```typescript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const result = await hbClient.agents.browserUse.startAndWait({
    task: "What is the title of the first post on Hacker News today?",
    llm: "gpt-4o",
    plannerLlm: "gpt-4o",
    pageExtractionLlm: "gpt-4o",
    useCustomApiKeys: true,
    apiKeys: {
      openai: "<OPENAI_API_KEY>",
      // Below are needed if Claude or Gemini models are used
      // anthropic: "<ANTHROPIC_API_KEY>",
      // google: "<GOOGLE_API_KEY>",
    },
  });

  console.log(`Output:\n\n${result.data?.finalResult}`);
};

main().catch((err) => {
  console.error(`Error: ${err.message}`);
});
```

{% endtab %}

{% tab title="Python" %}

```python
import os
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartBrowserUseTaskParams, BrowserUseApiKeys
from dotenv import load_dotenv

load_dotenv()

hb_client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


def main():
    resp = hb_client.agents.browser_use.start_and_wait(
        StartBrowserUseTaskParams(
            task="What is the title of the first post on HackerNews today?",
            llm="gpt-4o",
            planner_llm="gpt-4o",
            page_extraction_llm="gpt-4o",
            use_custom_api_keys=True,
            api_keys=BrowserUseApiKeys(
                openai="<OPENAI_API_KEY>",
                # Below are needed if Claude or Gemini models are used
                # anthropic="<ANTHROPIC_API_KEY>",
                # google="<GOOGLE_API_KEY>",
            )
        )
    )

    print(f"Output:\n\n{resp.data.final_result}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
```

{% endtab %}
{% endtabs %}

## Session Configurations

You can also provide configurations for the session that will be used to execute the browser-use task just as you would when creating a new session itself. These could include using a proxy or solving CAPTCHAs. To see the full list of session configurations, checkout the [Session API Reference](https://docs.hyperbrowser.ai/reference/api-reference/sessions).

{% hint style="info" %}
The `sessionOptions` will only apply if creating a new session when no `sessionId` is provided.
{% endhint %}

{% tabs %}
{% tab title="Node" %}

```javascript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const result = await hbClient.agents.browserUse.startAndWait({
    task: "go to Hacker News and summarize the top 5 posts of the day",
    sessionOptions: {
      acceptCookies: true,
    }
  });

  console.log(`Output:\n\n${result.data?.finalResult}`);
};

main().catch((err) => {
  console.error(`Error: ${err.message}`);
});
```

{% endtab %}

{% tab title="Python" %}

```python
import os
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartBrowserUseTaskParams, CreateSessionParams
from dotenv import load_dotenv

load_dotenv()

hb_client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


def main():
    resp = hb_client.agents.browser_use.start_and_wait(
        StartBrowserUseTaskParams(
            task="go to Hacker News and summarize the top 5 posts of the day",
            session_options=CreateSessionParams(
                accept_cookies=True,
            ),
        )
    )

    print(f"Output:\n\n{resp.data.final_result}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
```

{% endtab %}

{% tab title="cURL" %}

```bash
curl -X POST https://api.hyperbrowser.ai/api/task/browser-use \
    -H 'Content-Type: application/json' \
    -H 'x-api-key: <YOUR_API_KEY>' \
    -d '{
        "task": "go to Hacker News and summarize the top 5 posts of the day",
        "sessionOptions": {
            "acceptCookies": true
        }
    }'
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
Hyperbrowser's CAPTCHA solving and proxy usage features require being on a `PAID` plan.
{% endhint %}

{% hint style="info" %}
Using proxy and solving CAPTCHAs will slow down the web navigation in the browser-use task so use it only if necessary.
{% endhint %}



# Gemini Computer Use

Gemini Computer Use allows gemini to directly interact with your computer to perform tasks much like a human. This capability allows gemini to move the cursor, click buttons, type text, and navigate the web, thereby automating complex, multi-step workflows.

Hyperbrowser's Gemini Computer Use agent allows you to easily execute agent tasks on the web with just a simple call. Hyperbrowser exposes endpoints for starting/stopping a Gemini Computer Use task and for getting it's status and results.&#x20;

By default, these tasks are handled in an asynchronous manner of first starting the task and then checking it's status until it is completed. However, if you don't want to handle the monitoring yourself, our SDKs provide a simple function that handles the whole flow and returns the data once the task is completed.

## Installation

{% tabs %}
{% tab title="Node" %}

```bash
npm install @hyperbrowser/sdk
```

or

```bash
yarn add @hyperbrowser/sdk
```

{% endtab %}

{% tab title="Python" %}

```bash
pip install hyperbrowser
```

or&#x20;

```bash
uv add hyperbrowser
```

{% endtab %}
{% endtabs %}

## Usage

{% tabs %}
{% tab title="Node" %}

```javascript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const result = await hbClient.agents.geminiComputerUse.startAndWait({
    task: "what are the top 5 posts on Hacker News",
  });

  console.log(`Output:\n\n${result.data?.finalResult}`);
};

main().catch((err) => {
  console.error(`Error: ${err.message}`);
});
```

{% endtab %}

{% tab title="Python" %}

```python
import os
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartGeminiComputerUseTaskParams
from dotenv import load_dotenv

load_dotenv()

hb_client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


def main():
    resp = hb_client.agents.gemini_computer_use.start_and_wait(
        StartGeminiComputerUseTaskParams(
            task="what are the top 5 posts on Hacker News"
        )
    )

    print(f"Output:\n\n{resp.data.final_result}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
```

{% endtab %}

{% tab title="cURL" %}
Start Gemini Computer Use task

```bash
curl -X POST https://api.hyperbrowser.ai/api/task/gemini-computer-use \
    -H 'Content-Type: application/json' \
    -H 'x-api-key: <YOUR_API_KEY>' \
    -d '{
        "task": "what are the top 5 posts on Hacker News"
    }'
```

Get Gemini Computer Use task status

```bash
curl https://api.hyperbrowser.ai/api/task/gemini-computer-use/{jobId}/status \
    -H 'x-api-key: <YOUR_API_KEY>'
```

Get Gemini Computer Use task

```bash
curl https://api.hyperbrowser.ai/api/task/gemini-computer-use/{jobId} \
    -H 'x-api-key: <YOUR_API_KEY>'
```

Stop Gemini Computer Use task

```bash
curl -X PUT https://api.hyperbrowser.ai/api/task/gemini-computer-use/{jobId}/stop \
    -H 'x-api-key: <YOUR_API_KEY>'
```

{% endtab %}
{% endtabs %}

Gemini Computer Use tasks can be configured with a number of parameters. Some of them are described briefly here, but a list can be found in our [Gemini Computer Use API Reference](https://docs.hyperbrowser.ai/reference/api-reference/agents/gemini-computer-use).

<details>

<summary>Task parameters</summary>

* `task` - The instruction or goal to be accomplished by Gemini Computer Use.
* `llm` - The Gemini Computer Use model to use. By default, Hyperbrowser will use `gemini-2.5-computer-use-preview-10-2025`. A complete list is available in the [Gemini Computer Use API Reference](https://docs.hyperbrowser.ai/reference/api-reference/agents/gemini-computer-use#post-api-task-gemini-computer-use).

- `sessionId` - An optional existing browser session ID to connect to instead of creating a new one.

* `maxFailures` - The maximum number of consecutive failures allowed before the task is aborted.

- `maxSteps` - The maximum number of interaction steps the agent can take to complete the task.

* `keepBrowserOpen` - When enabled, keeps the browser session open after task completion.

- `sessionOptions` - [Options for the session](#session-configurations).

* `useCustomApiKeys` - When enabled, the API Keys provided by the user will be used to execute the agent task. No credits will be used for the Agent task itself if user provided keys are used, but the browser usage credits will still be charged for browser hours and proxy data usage.
* `apiKeys` - Object with optional API Key for google.
* `useComputerAction` - Allow the agent to interact by executing actions on the actual computer not just within the page. Allows the agent to see the entire screen instead of just the page contents.

</details>

{% hint style="info" %}
For detailed usage/schema, check out the [Gemini Computer Use API Reference](https://docs.hyperbrowser.ai/reference/api-reference/agents/gemini-computer-use).
{% endhint %}

{% hint style="info" %}
The agent may not complete the task within the specified `maxSteps`. If that happens, try increasing the `maxSteps` parameter.

Additionally, the browser session used by the AI Agent will time out based on your team's default **Session Timeout** settings or the session's `timeoutMinutes` parameter if provided. You can adjust the default Session Timeout in the [Settings page](https://app.hyperbrowser.ai/settings).&#x20;
{% endhint %}

## Reuse Browser Session

You can pass in an existing `sessionId` to the Gemini Computer Use task so that it can execute the task on an existing session. Also, if you want to keep the session open after executing the task, you can supply the `keepBrowserOpen` param.

{% hint style="info" %}
In the examples below, the `keepBrowserOpen` field is not set to true in the second call to the AI Agent so it will close the browser session after execution, and the session is being closed at the end with the `stop` function to make sure it gets closed.
{% endhint %}

{% tabs %}
{% tab title="Node" %}

```typescript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const session = await hbClient.sessions.create();

  try {
    const result = await hbClient.agents.geminiComputerUse.startAndWait({
      task: "What is the title of the first post on Hacker News today?",
      sessionId: session.id,
      keepBrowserOpen: true,
    });

    console.log(`Output:\n${result.data?.finalResult}`);

    const result2 = await hbClient.agents.geminiComputerUse.startAndWait({
      task: "Tell me how many upvotes the first post has.",
      sessionId: session.id,
    });

    console.log(`\nOutput:\n${result2.data?.finalResult}`);
  } catch (err) {
    console.error(`Error: ${err}`);
  } finally {
    await hbClient.sessions.stop(session.id);
  }
};

main().catch((err) => {
  console.error(`Error: ${err.message}`);
});

```

{% endtab %}

{% tab title="Python" %}

```python
import os
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartGeminiComputerUseTaskParams
from dotenv import load_dotenv

load_dotenv()

hb_client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


def main():
    session = hb_client.sessions.create()

    try:
        resp = hb_client.agents.gemini_computer_use.start_and_wait(
            StartGeminiComputerUseTaskParams(
                task="What is the title of the first post on Hacker News today?",
                session_id=session.id,
                keep_browser_open=True,
            )
        )

        print(f"Output:\n{resp.data.final_result}")

        resp2 = hb_client.agents.gemini_computer_use.start_and_wait(
            StartGeminiComputerUseTaskParams(
                task="Tell me how many upvotes the first post has.",
                session_id=session.id,
            )
        )

        print(f"\nOutput:\n{resp2.data.final_result}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        hb_client.sessions.stop(session.id)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")

```

{% endtab %}
{% endtabs %}

## Use Your Own API Keys

You can provide your own API Keys to the Gemini Computer Use task so that it doesn't charge credits to your Hyperbrowser account for the tokens it consumes during execution. Only the credits for the [usage of the browser itself](https://docs.hyperbrowser.ai/reference/pricing#browser-sessions) will be charged. You will need to provide your Google API Key when `useCustomApiKeys` is enabled.&#x20;

{% tabs %}
{% tab title="Node" %}

```typescript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const result = await hbClient.agents.geminiComputerUse.startAndWait({
    task: "What is the title of the first post on Hacker News today?",
    useCustomApiKeys: true,
    apiKeys: {
      anthropic: "<ANTHROPIC_API_KEY>"
    },
  });

  console.log(`Output:\n\n${result.data?.finalResult}`);
};

main().catch((err) => {
  console.error(`Error: ${err.message}`);
});

```

{% endtab %}

{% tab title="Python" %}

```python
import os
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartGeminiComputerUseTaskParams, GeminiComputerUseApiKeys
from dotenv import load_dotenv

load_dotenv()

hb_client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


def main():
    resp = hb_client.agents.gemini_computer_use.start_and_wait(
        StartGeminiComputerUseTaskParams(
            task="What is the title of the first post on HackerNews today?",
            use_custom_api_keys=True,
            api_keys=GeminiComputerUseApiKeys(
                google="<GOOGLE_API_KEY>"
            )
        )
    )

    print(f"Output:\n\n{resp.data.final_result}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
```

{% endtab %}
{% endtabs %}

## Session Configurations

You can also provide configurations for the session that will be used to execute the task just as you would when creating a new session itself. These could include using a proxy or solving CAPTCHAs. To see the full list of session configurations, checkout the [Session API Reference](https://docs.hyperbrowser.ai/reference/api-reference/sessions).

{% hint style="info" %}
The `sessionOptions` will only apply if creating a new session when no `sessionId` is provided.
{% endhint %}

{% tabs %}
{% tab title="Node" %}

```javascript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const result = await hbClient.agents.geminiComputerUse.startAndWait({
    task: "what are the top 5 posts on Hacker News",
    sessionOptions: {
      acceptCookies: true,
    }
  });

  console.log(`Output:\n\n${result.data?.finalResult}`);
};

main().catch((err) => {
  console.error(`Error: ${err.message}`);
});
```

{% endtab %}

{% tab title="Python" %}

```python
import os
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartGeminiComputerUseTaskParams, CreateSessionParams
from dotenv import load_dotenv

load_dotenv()

hb_client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


def main():
    resp = hb_client.agents.gemini_computer_use.start_and_wait(
        StartGeminiComputerUseTaskParams(
            task="what are the top 5 posts on Hacker News",
            session_options=CreateSessionParams(
                accept_cookies=True,
            ),
        )
    )

    print(f"Output:\n\n{resp.data.final_result}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
```

{% endtab %}

{% tab title="cURL" %}

```bash
curl -X POST https://api.hyperbrowser.ai/api/task/gemini-computer-use \
    -H 'Content-Type: application/json' \
    -H 'x-api-key: <YOUR_API_KEY>' \
    -d '{
        "task": "what are the top 5 posts on Hacker News",
        "sessionOptions": {
            "acceptCookies": true
        }
    }'
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
Hyperbrowser's CAPTCHA solving and proxy usage features require being on a `PAID` plan.
{% endhint %}

{% hint style="info" %}
Using proxy and solving CAPTCHAs will slow down the web navigation in the Gemini Computer Use task so use it only if necessary.
{% endhint %}



# HyperAgent

HyperAgent is our open-source tool that supercharges playwright with AI. To view the full details on HyperAgent, check out the [HyperAgent documentation](https://docs.hyperbrowser.ai/hyperagent/about-hyperagent). Here, we will just go over using one of the features of HyperAgent which is being able to have it automatically execute tasks on your behalf on the web with just a simple call. You can do this using our Agents API so all you have to worry about is providing the task and some other optional parameters.

By default, HyperAgent tasks are handled in an asynchronous manner of first starting the task and then checking it's status until it is completed. However, if you don't want to handle the monitoring yourself, our SDKs provide a simple function that handles the whole flow and returns the data once the task is completed.

## Installation

{% tabs %}
{% tab title="Node" %}

```bash
npm install @hyperbrowser/sdk
```

or

```bash
yarn add @hyperbrowser/sdk
```

{% endtab %}

{% tab title="Python" %}

```bash
pip install hyperbrowser
```

or&#x20;

```bash
uv add hyperbrowser
```

{% endtab %}
{% endtabs %}

## Usage

{% tabs %}
{% tab title="Node" %}

```javascript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const result = await hbClient.agents.hyperAgent.startAndWait({
    task: "What is the title of the first post on Hacker News today?",
  });

  console.log(`Output:\n\n${result.data?.finalResult}`);
};

main().catch((err) => {
  console.error(`Error: ${err.message}`);
});
```

{% endtab %}

{% tab title="Python" %}

```python
import os
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartHyperAgentTaskParams
from dotenv import load_dotenv

load_dotenv()

hb_client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


def main():
    resp = hb_client.agents.hyper_agent.start_and_wait(
        StartHyperAgentTaskParams(
            task="What is the title of the first post on Hacker News today?"
        )
    )

    print(f"Output:\n\n{resp.data.final_result}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
```

{% endtab %}

{% tab title="cURL" %}
Start HyperAgent task

```bash
curl -X POST https://api.hyperbrowser.ai/api/task/hyper-agent \
    -H 'Content-Type: application/json' \
    -H 'x-api-key: <YOUR_API_KEY>' \
    -d '{
        "task": "What is the title of the first post on Hacker News today?"
    }'
```

Get HyperAgent task status

```bash
curl https://api.hyperbrowser.ai/api/task/hyper-agent/{jobId}/status \
    -H 'x-api-key: <YOUR_API_KEY>'
```

Get HyperAgent task

```bash
curl https://api.hyperbrowser.ai/api/task/hyper-agent/{jobId} \
    -H 'x-api-key: <YOUR_API_KEY>'
```

Stop HyperAgent task

```bash
curl -X PUT https://api.hyperbrowser.ai/api/task/hyper-agent/{jobId}/stop \
    -H 'x-api-key: <YOUR_API_KEY>'
```

{% endtab %}
{% endtabs %}

HyperAgent tasks can be configured with a number of parameters. Some of them are described briefly here, but a list can be found in our [HyperAgent API Reference](https://docs.hyperbrowser.ai/reference/api-reference/agents/hyperagent).

<details>

<summary>HyperAgent Task parameters</summary>

* `llm` - The language model (LLM) instance to use for executing the task. By default, HyperAgent will use `gpt-4o`. A complete list is available in the [HyperAgent API Reference](https://docs.hyperbrowser.ai/reference/api-reference/agents/hyperagent).

- `sessionId` - An optional existing browser session ID to connect to instead of creating a new one.

* `maxSteps` - The maximum number of steps HyperAgent can take before concluding the task.

- `keepBrowserOpen` - When enabled, keeps the browser session open after task completion.

* `sessionOptions` - [Options for the session](#session-configurations).

- `useCustomApiKeys` - When enabled, the API Keys provided by the user will be used to execute the agent task. No credits will be used for the Agent task itself if user provided keys are used, but the browser usage credits will still be charged for browser hours and proxy data usage.
- `apiKeys` - Object with optional API Keys for openai, anthropic, and google.

</details>

{% hint style="info" %}
For detailed usage/schema, check out the [HyperAgent API Reference](https://docs.hyperbrowser.ai/reference/api-reference/agents/hyperagent).
{% endhint %}

{% hint style="info" %}
The agent may not complete the task within the specified `maxSteps`. If that happens, try increasing the `maxSteps` parameter.

Additionally, the browser session used by the AI Agent will time out based on your team's default **Session Timeout** settings or the session's `timeoutMinutes` parameter if provided. You can adjust the default Session Timeout in the [Settings page](https://app.hyperbrowser.ai/settings).&#x20;
{% endhint %}

## Reuse Browser Session

You can pass in an existing `sessionId` to the HyperAgent task so that it can execute the task on an existing session. Also, if you want to keep the session open after executing the task, you can supply the `keepBrowserOpen` param.

{% hint style="info" %}
In the examples below, the `keepBrowserOpen` field is not set to true in the second call to the AI Agent so it will close the browser session after execution, and the session is being closed at the end with the `stop` function to make sure it gets closed.
{% endhint %}

{% tabs %}
{% tab title="Node" %}

```typescript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const session = await hbClient.sessions.create();

  try {
    const result = await hbClient.agents.hyperAgent.startAndWait({
      task: "What is the title of the first post on Hacker News today?",
      sessionId: session.id,
      keepBrowserOpen: true,
    });

    console.log(`Output:\n${result.data?.finalResult}`);

    const result2 = await hbClient.agents.hyperAgent.startAndWait({
      task: "Tell me how many upvotes the first post has.",
      sessionId: session.id,
    });

    console.log(`\nOutput:\n${result2.data?.finalResult}`);
  } catch (err) {
    console.error(`Error: ${err}`);
  } finally {
    await hbClient.sessions.stop(session.id);
  }
};

main().catch((err) => {
  console.error(`Error: ${err.message}`);
});
```

{% endtab %}

{% tab title="Python" %}

```python
import os
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartHyperAgentTaskParams
from dotenv import load_dotenv

load_dotenv()

hb_client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


def main():
    session = hb_client.sessions.create()

    try:
        resp = hb_client.agents.hyper_agent.start_and_wait(
            StartHyperAgentTaskParams(
                task="What is the title of the first post on Hacker News today?",
                session_id=session.id,
                keep_browser_open=True,
            )
        )

        print(f"Output:\n{resp.data.final_result}")

        resp2 = hb_client.agents.hyper_agent.start_and_wait(
            StartHyperAgentTaskParams(
                task="Tell me how many upvotes the first post has.",
                session_id=session.id,
            )
        )

        print(f"\nOutput:\n{resp2.data.final_result}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        hb_client.sessions.stop(session.id)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
```

{% endtab %}
{% endtabs %}

## Use Your Own API Keys

You can provide your own API Keys to the HyperAgent task so that it doesn't charge credits to your Hyperbrowser account for the steps it takes during execution. Only the credits for the [usage of the browser itself](https://docs.hyperbrowser.ai/reference/pricing#browser-sessions) will be charged. Depending on which model you select for the `llm`, the API key from that provider will need to be provided when `useCustomApiKeys` is set to true.

{% tabs %}
{% tab title="Node" %}

```typescript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const result = await hbClient.agents.hyperAgent.startAndWait({
    task: "What is the title of the first post on Hacker News today?",
    llm: "gpt-4o",
    useCustomApiKeys: true,
    apiKeys: {
      openai: "<OPENAI_API_KEY>"
    },
  });

  console.log(`Output:\n\n${result.data?.finalResult}`);
};

main().catch((err) => {
  console.error(`Error: ${err.message}`);
});
```

{% endtab %}

{% tab title="Python" %}

```python
import os
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartHyperAgentTaskParams, HyperAgentApiKeys
from dotenv import load_dotenv

load_dotenv()

hb_client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


def main():
    resp = hb_client.agents.hyper_agent.start_and_wait(
        StartHyperAgentTaskParams(
            task="What is the title of the first post on HackerNews today?",
            llm="gpt-4o",
            use_custom_api_keys=True,
            api_keys=HyperAgentApiKeys(
                openai="<OPENAI_API_KEY>"
            )
        )
    )

    print(f"Output:\n\n{resp.data.final_result}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
```

{% endtab %}
{% endtabs %}

## Session Configurations

You can also provide configurations for the session that will be used to execute the HyperAgent task just as you would when creating a new session itself. These could include using a proxy or solving CAPTCHAs. To see the full list of session configurations, checkout the [Session API Reference](https://docs.hyperbrowser.ai/reference/api-reference/sessions).

{% hint style="info" %}
The `sessionOptions` will only apply if creating a new session when no `sessionId` is provided.
{% endhint %}

{% tabs %}
{% tab title="Node" %}

```javascript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const result = await hbClient.agents.hyperAgent.startAndWait({
    task: "What is the title of the top post on HackerNews today?",
    sessionOptions: {
      acceptCookies: true,
    }
  });

  console.log(`Output:\n\n${result.data?.finalResult}`);
};

main().catch((err) => {
  console.error(`Error: ${err.message}`);
});
```

{% endtab %}

{% tab title="Python" %}

```python
import os
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartHyperAgentTaskParams, CreateSessionParams
from dotenv import load_dotenv

load_dotenv()

hb_client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


def main():
    resp = hb_client.agents.hyper_agent.start_and_wait(
        StartHyperAgentTaskParams(
            task="What is the title of the top post on HackerNews today?",
            session_options=CreateSessionParams(
                accept_cookies=True,
            ),
        )
    )

    print(f"Output:\n\n{resp.data.final_result}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
```

{% endtab %}

{% tab title="cURL" %}

```bash
curl -X POST https://api.hyperbrowser.ai/api/task/hyper-agent \
    -H 'Content-Type: application/json' \
    -H 'x-api-key: <YOUR_API_KEY>' \
    -d '{
        "task": "What is the title of the top post on HackerNews today?",
        "sessionOptions": {
            "acceptCookies": true
        }
    }'
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
Hyperbrowser's CAPTCHA solving and proxy usage features require being on a `PAID` plan.
{% endhint %}

{% hint style="info" %}
Using proxy and solving CAPTCHAs will slow down the web navigation in the HyperAgent task so use it only if necessary.
{% endhint %}


# Multi-Page actions

HyperAgent is built around playwright, and offers a natural way to extend the functionality of playwright to also perform tasks like an independent web-agent.

This can be done simply by using the `.ai()`  method available on all page objects.

Here is a simple example showing how to do this:

{% code overflow="wrap" %}

```typescript
const agent = new HyperAgent();

const page1 = await agent.newPage();
const page2 = await agent.newPage();

// Execute tasks on specific pages
const page1Response = await page1.ai(
  "Go to google.com/travel/explore and set the starting location to New York. Then, return to me the first recommended destination that shows up. Return to me only the name of the location."
);
const page2Response = await page2.ai(
  `I want to plan a trip to ${page1Response.output}. Recommend me places to visit there.`
);

console.log(page2Response.output);
```

{% endcode %}

Each page can act as a separate web-agent by itself.

All `page.ai` calls can take in two parameters:

* `task` : A string describing the task to be completed on this page
* `params` (Optional): An object containing the parameters of the task. A list of accepted parameters can be found in the [HyperAgent Types page](https://docs.hyperbrowser.ai/hyperagent/about-hyperagent/hyperagent-types#taskparams)

### Extracting info from a page

HyperAgent also offers a quick method of extracting information from a page using the `.extract()` method

{% code overflow="wrap" %}

```typescript
const agent = new HyperAgent();

const page = await agent.newPage();

// Execute tasks on specific pages
await page.goto("https://en.wikipedia.org/wiki/2014_FIFA_World_Cup");
const pageResponse = await page.extract("Tell me the countries that participated in the 2014 FIFA world cup");

console.log(pageResponse);
```

{% endcode %}

All `page.extract` calls can take in two parameters:

* `task`: A string describing what needs to be extracted from the current page
* `outputSchema` (optional): A zod object  describing the schema of the output expected.


# Scraping

## Scraping a web page

With supplying just a url, you can easily extract the contents of a page in markdown format with the `/scrape` endpoint.

{% tabs %}
{% tab title="Node" %}

```typescript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const client = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  // Handles both starting and waiting for scrape job response
  const scrapeResult = await client.scrape.startAndWait({
    url: "https://example.com",
  });
  console.log("Scrape result:", scrapeResult);
};

main();
```

{% endtab %}

{% tab title="Python" %}

```python
import os
from dotenv import load_dotenv
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartScrapeJobParams
​
# Load environment variables from .env file
load_dotenv()
​
# Initialize Hyperbrowser client
client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))
​
​
# Start scraping and wait for completion
scrape_result = client.scrape.start_and_wait(
    StartScrapeJobParams(url="https://example.com")
)
print("Scrape result:", scrape_result)
```

{% endtab %}

{% tab title="cURL" %}
Start Scrape Job

```bash
curl -X POST https://api.hyperbrowser.ai/api/scrape \
    -H 'Content-Type: application/json' \
    -H 'x-api-key: <YOUR_API_KEY>' \
    -d '{
        "url": "https://example.com"
    }'
```

Get Scrape Job Status

```bash
curl https://api.hyperbrowser.ai/api/scrape/{jobId}/status \
    -H 'x-api-key: <YOUR_API_KEY>'
```

Get Scrape Job Status and Data

```bash
curl https://api.hyperbrowser.ai/api/scrape/{jobId} \
    -H 'x-api-key: <YOUR_API_KEY>'
```

{% endtab %}
{% endtabs %}

Now, let's take an in depth look at all the provided options for scraping.

### Session Options

All Scraping APIs (scrape, crawl, extract) support session parameters. You can see the [session parameters listed here](https://docs.hyperbrowser.ai/sessions/overview/session-parameters).

### Scrape Options

**`formats`**

* **Type**: `array`
* **Items**: `string`
* **Enum**: `["html", "links", "markdown", "screenshot"]`
* **Description**: Choose the formats to include in the API response:
  * `html` - Returns the scraped content as HTML.
  * `links` - Includes a list of links found on the page.
  * `markdown` - Provides the content in Markdown format.
  * `screenshot` - Provides a screenshot of the page.
* **Default**: `["markdown"]`

**`includeTags`**

* **Type**: `array`
* **Items**: `string`
* **Description**: Provide an array of HTML tags, classes, or IDs to include in the scraped content. Only elements matching these selectors will be returned.
* **Default**: `undefined`

**`excludeTags`**

* **Type**: `array`
* **Items**: `string`
* **Description**: Provide an array of HTML tags, classes, or IDs to exclude from the scraped content. Elements matching these selectors will be omitted from the response.
* **Default**: `undefined`

**`onlyMainContent`**

* **Type**: `boolean`
* **Description**: When set to `true` (default), the API will attempt to return only the main content of the page, excluding common elements like headers, navigation menus, and footers. Set to `false` to return the full page content.
* **Default**: `true`

**`waitFor`**

* **Type**: `number`
* **Description**: Specify a delay in milliseconds to wait after the page loads before initiating the scrape. This can be useful for allowing dynamic content to fully render. This is also useful for waiting to detect CAPTCHAs on the page if you have `solveCaptchas` set to true in the `sessionOptions`.
* **Default**: `0`

**`timeout`**

* **Type**: `number`
* **Description**: Specify the maximum time in milliseconds to wait for the page to load before timing out. This would be like doing:

```typescript
await page.goto("https://example.com", { waitUntil: "load", timeout: 30000 })
```

* **Default**: `30000` (30 seconds)

**`waitUntil`**&#x20;

* **Type**: `string`
* **Enum**: `["load", "domcontentloaded", "networkidle"]`&#x20;
* **Description**: Specify the condition to wait for the page to load:
  * `domcontentloaded`: Wait until the HTML is fully parsed and DOM is ready
  * `load` - Wait until DOM and all resources are completely loaded
  * `networkidle` - Wait until no more network requests occur for a certain period of time
* **Default**: `load`&#x20;

**`screenshotOptions`**

* **Type**: `object`
* **Properties**:
  * **fullPage** - Take screenshot of the full page beyond the viewport
    * **Type**: `boolean`
    * **Default**: `false`
  * **format** - The image type of the screenshot
    * **Type**: `string`
    * **Enum**: `["webp", "jpeg", "png"]`
    * **Default**: `webp`&#x20;
* **Description**: Configurations for the returned screenshot. Only applicable if `screenshot` is provided in the `formats` array.

### Example

By configuring these options when making a scrape request, you can control the format and content of the scraped data, as well as the behavior of the scraper itself.

For example, to scrape a page with the following:

* In stealth mode
* With CAPTCHA solving
* Return only the main content as HTML
* Exclude any `<span>` elements
* Wait 2 seconds after the page loads and before scraping

{% tabs %}
{% tab title="Node" %}

```typescript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const client = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const scrapeResult = await client.scrape.startAndWait({
    url: "https://example.com",
    sessionOptions: {
      useStealth: true,
      solveCaptchas: true,
    },
    scrapeOptions: {
      formats: ["html"],
      onlyMainContent: true,
      excludeTags: ["span"],
      waitFor: 2000,
    },
  });
  console.log("Scrape result:", scrapeResult);
};

main();
```

{% endtab %}

{% tab title="Python" %}

```python
import os
from dotenv import load_dotenv
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartScrapeJobParams, CreateSessionParams, ScrapeOptions


load_dotenv()


client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


scrape_result = client.scrape.start_and_wait(
    StartScrapeJobParams(
        url="https://example.com",
        session_options=CreateSessionParams(use_stealth=True, solve_captchas=True),
        scrape_options=ScrapeOptions(
            formats=["html"],
            only_main_content=True,
            exclude_tags=["span"],
            wait_for=2000,
        ),
    )
)

print("Scrape result:", scrape_result.model_dump_json(indent=2))
```

{% endtab %}

{% tab title="cURL" %}

```bash
curl -X POST https://api.hyperbrowser.ai/api/scrape \
    -H 'Content-Type: application/json' \
    -H 'x-api-key: <YOUR_API_KEY>' \
    -d '{
            "url": "https://example.com",
            "sessionOptions": {
                    "useStealth": true,
                    "solveCaptchas": true
            },
            "scrapeOptions": {
                    "formats": ["html"],
                    "onlyMainContent": true, 
                    "excludeTags": ["span"],
                    "waitFor": 2000
            }
    }'
```

{% endtab %}
{% endtabs %}

## Crawl a Site

Instead of just scraping a single page, you might want to get all the content across multiple pages on a site. The `/crawl`  endpoint is perfect for such a task. You can use the same `sessionOptions` and `scrapeOptions` as before for this endpoint as well. The crawl endpoint does have some extra parameters that are used to tailor the crawl to your scraping needs.

### Crawl Options

**Limiting the Number of Pages to Crawl with `maxPages`**

* **Type**: `integer`
* **Minimum**: 1
* **Description**: The maximum number of pages to crawl before stopping.&#x20;

**Following Links with `followLinks`**

* **Type**: `boolean`
* **Default**: `true`
* **Description**: When set to `true`, the crawler will follow links found on the pages it visits, allowing it to discover new pages and expand the scope of the crawl. When set to `false`, the crawler will only visit the starting URL and any explicitly specified pages, without following any additional links.

**Ignoring the Sitemap with `ignoreSitemap`**

* **Type**: `boolean`
* **Default**: `false`
* **Description**: When set to `true`, the crawler will not pre-generate a list of urls from potential sitemaps it finds. The crawler will try to locate sitemaps beginning at the base URL of the URL provided in the `url` param.

**Excluding Pages with `excludePatterns`**

* **Type**: `array`
* **Items**: `string`
* **Description**: An array of regular expressions or wildcard patterns specifying which URLs should be excluded from the crawl. Any pages whose URLs' path match one of these patterns will be skipped.

**Including Pages with `includePatterns`**

* **Type**: `array`
* **Items**: `string`
* **Description**: An array of regular expressions or wildcard patterns specifying which URLs should be included in the crawl. Only pages whose URLs' path match one of these path patterns will be visited.

### Example

By configuring these options when initiating a crawl, you can control the scope and behavior of the crawler to suit your specific needs.

For example, to crawl a site with the following:

* Maximum of 5 pages
* Only include `/blog` pages
* Return only the main content as markdown
* Exclude any `<span>` elements

{% tabs %}
{% tab title="Node" %}

```typescript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";

config();

const client = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const main = async () => {
  const crawlResult = await client.crawl.startAndWait({
    url: "https://hyperbrowser.ai",
    maxPages: 5,
    includePatterns: ["/blog/*"],
    scrapeOptions: {
      formats: ["markdown"],
      onlyMainContent: true,
      excludeTags: ["span"],
    },
  });
  console.log("Crawl result:", crawlResult);
};

main();
```

{% endtab %}

{% tab title="Python" %}

```python
import os
from dotenv import load_dotenv
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartCrawlJobParams, ScrapeOptions


load_dotenv()


client = Hyperbrowser(api_key=os.getenv("HYPERBROWSER_API_KEY"))


crawl_result = client.crawl.start_and_wait(
    StartCrawlJobParams(
        url="https://hyperbrowser.ai",
        max_pages=5,
        include_patterns=["/blog/*"],
        scrape_options=ScrapeOptions(
            formats=["markdown"],
            only_main_content=True,
            exclude_tags=["span"],
        ),
    )
)

print("Crawl result:", crawl_result.model_dump_json(indent=2))
```

{% endtab %}

{% tab title="cURL" %}

```bash
curl -X POST https://api.hyperbrowser.ai/api/crawl \
    -H 'Content-Type: application/json' \
    -H 'x-api-key: <YOUR_API_KEY>' \
    -d '{
            "url": "https://hyperbrowser.ai",
            "maxPages": 5,
            "includePatterns": ["/blog/*"],
            "scrapeOptions": {
                    "formats": ["markdown"],
                    "onlyMainContent": true, 
                    "excludeTags": ["span"]
            }
    }'
```

{% endtab %}
{% endtabs %}

## Structured Extraction

The Extract API allows you to fetch data in a well-defined structure from any webpage or website with just a few lines of code. You can provide a list of web pages, and hyperbrowser will collate all the information together and extract the information that best fits the provided schema (or prompt). You have access to the same `SessionOptions`available here as well.&#x20;

### Extract Options:

**Specifying all page to collect data from with** `urls`

* **Type**: `array`
* **Items**: `string`
* **Required**: Yes
* **Description**: List of URLs to extract data from. To crawl a site, add `/*` to a URL (e.g., `https://example.com/*`). This will crawl other pages on the site with the same origin and find relevant pages to use for the extraction context.

#### Specify the extraction `schema`

* **Type**: `object`
* **Required**: No
* **Description**: JSON schema defining the structure of the data you want to extract. Gives the best results with clear data structure requirements.
* **Note**: You must provide either a `schema` or a `prompt`. If both are provided, the schema takes precedence.
* Default: `undefined`

**Specify the data to be extracted from a** `prompt`

* **Type**: `string`
* **Required**: No
* **Description**: A prompt describing how you want the data structured. Useful if you don't have a specific schema in mind.
* **Note**: You must provide either a `schema` or a `prompt`. If both are provided, the schema takes precedence.
* Default: `undefined`

**Further specify the extraction process with a** `systemPrompt`

* **Type**: `string`
* **Required**: No
* **Description**: Additional instructions for the extraction process to guide the AI's behavior.
* Default: `undefined`

**Specify the number of pages to collect information from with** `maxLinks`

* **Type**: `number`
* **Description**: Maximum number of links to follow when crawling a site for any given URL with `/*` suffix.
* **Default**: `undefined`

**Max time to wait on a page before extraction using** `waitFor`

* **Type**: `number`
* **Description**: Time in milliseconds to wait after page load before extraction. This can be useful for allowing dynamic content to fully render or for waiting to detect CAPTCHAs if you have `solveCaptchas` set to true.
* **Default**: `0`&#x20;

**Set options for the session with** [`sessionOptions`](https://docs.hyperbrowser.ai/web-scraping/extract#session-configurations)&#x20;

* **Type**: object
* **Default**: `undefined`

{% hint style="info" %}
One of `schema` or `prompt` must be defined.
{% endhint %}

### Example

By configuring these options when initiating a structured extraction, you can control the scope and behavior to suit your specific needs.

For example, to crawl a site with the following:

* Maximum of 5 pages per URL
* Include `/products` on example.com, and as many subsequent pages as possible on test.com up to 5 pages
* Return the extracted data in the specified schema
* Wait 2 seconds after the page loads and before extracting

For more detail, check out the [Extract](https://docs.hyperbrowser.ai/web-scraping/extract) page.

```bash
curl -X POST https://api.hyperbrowser.ai/api/extract \
    -H 'Content-Type: application/json' \
    -H 'x-api-key: <YOUR_API_KEY>' \
    -d '{
        "urls": ["https://example.com/products","https://www.test.com/*"],
        "prompt": "Extract the product information from this page",
        "schema": {
            "type": "object",
            "properties": {
                "productName": {
                    "type": "string"
                },
                "price": {
                    "type": "string"
                },
                "features": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": [
                "productName",
                "price",
                "features"
            ]
        },
        "maxLinks": 5,
        "waitFor": 2000,
        "sessionOptions": {
            "useStealth": true,
            "solveCaptchas": true,
            "adblock": true
        }
    }'
```



# Extract Information with an LLM

In this guide, we'll use Hyperbrowser's Node.js SDK to get formatted data from a Wikipedia page and then feed it into an LLM like ChatGPT to extract the information we want. Our goal is to get a list of the most populous cities.

{% hint style="info" %}
For most use cases, we would recommend using the [Extract API](https://docs.hyperbrowser.ai/web-scraping/extract) itself.&#x20;
{% endhint %}

## Setup

First, lets create a new Node.js project.

```bash
mkdir wiki-scraper && cd wiki-scraper
npm init -y
```

### Installation

Next, let's install the necessary dependencies to run our script.

```bash
npm install @hyperbrowser/sdk dotenv openai zod
```

### Setup your Environment

To use Hyperbrowser with your code, you will need an API Key. You can get one easily from the [dashboard](https://app.hyperbrowser.ai/). Once you have your API Key, add it to your `.env` file as `HYPERBROWSER_API_KEY` . You will also need an `OPENAI_API_KEY` to use ChatGPT to extract information from our scraped data.

## Code

Next, create a new file `scraper.js` and add the following code:

```javascript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";
import { z } from "zod";
import fs from "fs";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

config();

const client = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CitySchema = z.object({
  city: z.string(),
  country: z.string(),
  population: z.number(),
  rank: z.number(),
});

const ResponseSchema = z.object({ cities: z.array(CitySchema) });

const SYSTEM_PROMPT = `You are a helpful assistant that can extract information from markdown and convert it into a structured format.
Ensure the output adheres to the following:
- city: The name of the city
- country: The name of the country
- population: The population of the city
- rank: The rank of the city

Provide the extracted data as a JSON object. Parse the Markdown content carefully to identify and categorize the city details accurately.
`;

const main = async () => {
  console.log("Started scraping");
  const scrapeResult = await client.scrape.startAndWait({
    url: "https://en.wikipedia.org/wiki/List_of_largest_cities",
    scrapeOptions: {
      // Only return the markdown for the scraped data
      formats: ["markdown"],
      // Only include the table element with class `wikitable` from the page
      includeTags: [".wikitable"],
      // Remove any img tags from the table
      excludeTags: ["img"],
    },
  });
  console.log("Finished scraping");
  if (scrapeResult.status === "failed") {
    console.error("Scrape failed:", scrapeResult.error);
    return;
  }
  if (!scrapeResult.data.markdown) {
    console.error("No markdown data found in the scrape result");
    return;
  }

  console.log("Extracting data from markdown");
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      { role: "user", content: scrapeResult.data.markdown },
    ],
    response_format: zodResponseFormat(ResponseSchema, "cities"),
  });
  console.log("Finished extracting data from markdown");

  const cities = completion.choices[0].message.parsed;

  const data = JSON.stringify(cities, null, 2);
  fs.writeFileSync("cities.json", data);
};

main();
```

With just a single call to the SDK's scrape `startAndWait` function, we can get back the exact information we need from the page in properly formatted markdown. To make sure we narrow down the data we get back to just the information we need, we make sure to only include the `wikiTable` class element and remove any unnecessary image tags.

Once we have the markdown text, we can simply just pass it into the request to the `parse` function from the openai library with the `response_format` we want and we will have our list of the most populous cities.

### Run the Scraper

Once you have the code copied, you can run the script with:

```bash
node scraper.js
```

If everything completes successfully, you should see a `cities.json` file in your project directory with the data in this format:

```json
{
  "cities": [
    {
      "city": "Tokyo",
      "country": "Japan",
      "population": 37468000,
      "rank": 1
    },
    {
      "city": "Delhi",
      "country": "India",
      "population": 28514000,
      "rank": 2
    },
    {
      "city": "Shanghai",
      "country": "China",
      "population": 25582000,
      "rank": 3
    },
    ...
  ]
}
```

## Next Steps

This is a simple example, but you can adapt it to scrape more complex data from other sites, or crawl entire websites.


# CAPTCHA Solving

{% hint style="info" %}
Hyperbrowser's CAPTCHA solving feature requires being on a `PAID` plan.
{% endhint %}

In this guide, we will see how to use Hyperbrowser and its integrated CAPTCHA solver to scrape Today's Top Deals from Amazon without being blocked.

## Setup

First, lets create a new Node.js project.

```bash
mkdir amazon-deals-scraper && cd amazon-deals-scraper
npm init -y
```

### Installation

Next, let's install the necessary dependencies to run our script.

```bash
npm install @hyperbrowser/sdk puppeteer-core dotenv
```

### Setup your Environment

To use Hyperbrowser with your code, you will need an API Key. You can get one easily from the [dashboard](https://app.hyperbrowser.ai/). Once you have your API Key, add it to your `.env` file as `HYPERBROWSER_API_KEY`.

## Code

Next, create a new file `index.js` and add the following code:

```javascript
import { Hyperbrowser } from "@hyperbrowser/sdk";
import { config } from "dotenv";
import { connect } from "puppeteer-core";

config();

const client = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  console.log("Starting session");
  const session = await client.sessions.create({
    solveCaptchas: true,
    adblock: true,
    annoyances: true,
    trackers: true,
  });
  console.log("Session created:", session.id);

  try {
    const browser = await connect({
      browserWSEndpoint: session.wsEndpoint,
      defaultViewport: null,
    });

    const [page] = await browser.pages();

    await page.goto("https://amazon.com/deals", {
      waitUntil: "load",
      timeout: 20_000,
    });

    const pageTitle = await page.title();
    console.log("Navigated to Page:", pageTitle);

    await sleep(10_000);

    const products = await page.evaluate(() => {
      const items = document.querySelectorAll(".dcl-carousel-element");
      return Array.from(items)
        .map((item) => {
          const nameElement = item.querySelector(".dcl-product-label");
          const dealPriceElement = item.querySelector(
            ".dcl-product-price-new .a-offscreen"
          );
          const originalPriceElement = item.querySelector(
            ".dcl-product-price-old .a-offscreen"
          );
          const percentOffElement = item.querySelector(
            ".dcl-badge .a-size-mini"
          );

          return {
            name: nameElement ? nameElement.textContent?.trim() : null,
            dealPrice: dealPriceElement
              ? dealPriceElement.textContent?.trim()
              : null,
            originalPrice: originalPriceElement
              ? originalPriceElement.textContent?.trim()
              : null,
            percentOff: percentOffElement
              ? percentOffElement.textContent?.trim()
              : null,
          };
        })
        .filter((product) => product.name && product.dealPrice);
    });

    console.log("Found products:", JSON.stringify(products, null, 2));
  } catch (error) {
    console.error(`Encountered an error: ${error}`);
  } finally {
    await client.sessions.stop(session.id);
    console.log("Session stopped:", session.id);
  }
};

main().catch((error) => {
  console.error(`Encountered an error: ${error}`);
});
```

{% hint style="info" %}
If you are trying to solve simple image based captchas (the kind which get input into a  text box for verification), you also have to add the `imageCaptchaParams`field. It takes an array of objects. Each object has a parameter for image selector and input selector. Together, these are used to specify where the source of a captcha will come from, and the input box into which the solution will have to be filled in. \
\
The selectors follow the standard html query-selector format [as specified on mdn](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector).
{% endhint %}

### Run the Scraper

To run the Amazon deals scraper:

1. In your terminal, navigate to the project directory
2. Run the script with Node.js:

```bash
node index.js
```

The script will:

1. Create a new Hyperbrowser session with captcha solving, ad blocking, and anti-tracking enabled
2. Launch a Puppeteer browser and connect it to the session
3. Navigate to the Amazon deals page, solving any CAPTCHAs that are encountered
4. Wait 10 seconds for the page to load its content
5. Scrape the deal data using Puppeteer's `page.evaluate` method
6. Print the scraped products to the console
7. Close the browser and stop the Hyperbrowser session

You should see the scraped products printed in the console, like:

```json
[
  {
    "name": "Apple AirPods Pro",
    "dealPrice": "$197.00",
    "originalPrice": "$249.99", 
    "percentOff": "21% off"
  },
  {
    "name": "Echo Dot (4th Gen)", 
    "dealPrice": "$27.99",
    "originalPrice": "$49.99",
    "percentOff": "44% off"  
  }
]
```

### How it Works

Let's break down the key parts:

1. We create a new Hyperbrowser session with `solveCaptchas`, `adblock`, `annoyances`, and `trackers` set to `true`. This enables the captcha solver and other anti-bot evasion features.
2. We launch a Puppeteer browser and connect it to the Hyperbrowser session.
3. We navigate to the Amazon deals page and wait for any CAPTCHAs to be solved automatically by Hyperbrowser.
4. We pause execution for 10 seconds with `sleep` to allow all content to be loaded.
5. We use `page.evaluate` to run JavaScript on the page to scrape the deal data.
6. In the evaluator function, we select the deal elements, extract the relevant data, and return an array of product objects.
7. We print the scraped data and stop the Hyperbrowser session.

Without the `solveCaptchas` enabled, we could encounter a screen like this when trying to navigate to the deals page:

<figure><img src="https://4095930873-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FfwZVRs9Jmwzw9cfbchYG%2Fuploads%2FUo9d9TCWSxzh65PtYQBx%2Famazon-captcha.png?alt=media&#x26;token=31203321-a09f-4f74-9612-36ae59650a28" alt=""><figcaption></figcaption></figure>

The captcha solver runs automatically in the background, so we don't need to handle captchas explicitly in our script. If a captcha appears, Hyperbrowser will solve it and continue loading the page. In this case, it would solve this CAPTCHA and continue on to the deals page.
