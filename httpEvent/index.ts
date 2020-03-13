import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");

  context.res = {
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: JSON.stringify(req, null, 4)
  };
};

export default httpTrigger;
