import { Client, cacheExchange, fetchExchange } from "urql";

interface MockResponse {
  query: RegExp | string;
  response?: any;
  error?: Error;
}

/**
 * Creates a mock URQL client for Storybook and testing purposes
 * @param mockResponses Array of mock responses to return for specific queries
 * @returns Mock URQL client
 */
export function mockClient(mockResponses: MockResponse[]): Client {
  const mockFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const body = init?.body as string;
    
    // Parse the GraphQL query from the request body
    let queryString = "";
    try {
      const parsed = JSON.parse(body);
      queryString = parsed.query || "";
    } catch {
      queryString = body || "";
    }

    // Find matching mock response
    const mockResponse = mockResponses.find(mock => {
      if (mock.query instanceof RegExp) {
        return mock.query.test(queryString);
      }
      return queryString.includes(mock.query);
    });

    if (mockResponse) {
      if (mockResponse.error) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              errors: [{ message: mockResponse.error.message }]
            }),
            {
              status: 200,
              statusText: "OK",
              headers: { "Content-Type": "application/json" }
            }
          )
        );
      }

      return Promise.resolve(
        new Response(
          JSON.stringify({ data: mockResponse.response }),
          {
            status: 200,
            statusText: "OK",
            headers: { "Content-Type": "application/json" }
          }
        )
      );
    }

    // Default response if no mock found
    return Promise.resolve(
      new Response(
        JSON.stringify({ 
          errors: [{ message: `No mock response found for query: ${queryString.slice(0, 100)}...` }] 
        }),
        {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" }
        }
      )
    );
  };

  return new Client({
    url: "http://localhost:3000/api/graphql",
    exchanges: [cacheExchange, fetchExchange],
    fetch: mockFetch,
  });
}