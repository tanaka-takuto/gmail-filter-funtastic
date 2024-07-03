import { Label } from "../domain/label";
import { UnlabeldeDomain } from "../domain/unlabeldeDomain";

// DetermineLabelResponse is a response of determineLabel method.
export interface DetermineLabelResponse {
  list: {
    domain: string;
    mainCategory: string;
    subCategory: string;
    serviceName: string;
  }[];
}

export class OpenAIClient {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // determineLabel determines labels for domains.
  async determineLabel(
    domains: UnlabeldeDomain[],
    labels: Label[],
  ): Promise<DetermineLabelResponse> {
    const COMPLETIONS_API = "https://api.openai.com/v1/chat/completions";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
    const systemPrompt = `メールアドレスにラベルを付与して管理しています。
入力した複数のメールアドレスのドメインを元に、ラベルを決定します。

# 制約
- 日本語
- 下記JSONで出力

# JSON
{
  "list": [{
    domain: "入力したドメイン(@を含む)";
    mainCategory: "メインカテゴリ(10文字以内)";
    subCategory: "サブカテゴリ(10文字以内)";
    serviceName: "サービス名";
  }]
}
`;

    const userPrompt = `# 入力
${domains.map((domain) => domain.domain).join("\n")}

# 参考ラベル一覧
${labels.map((label) => label.name).join("\n")}
`;

    const body = {
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
    };

    try {
      const request = UrlFetchApp.getRequest(COMPLETIONS_API, {
        method: "post",
        headers: headers,
        payload: JSON.stringify(body),
      });
      Logger.log(`request: ${JSON.stringify(request)}`);

      const response = UrlFetchApp.fetch(COMPLETIONS_API, {
        method: "post",
        headers: headers,
        payload: JSON.stringify(body),
      });
      Logger.log(
        `response: ${response.getContentText()}, ${response.getResponseCode()}`,
      );
      const responseJson = JSON.parse(response.getContentText());
      return JSON.parse(
        responseJson.choices[0].message.content,
      ) as DetermineLabelResponse;
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }
}
