import { ClientResponse, DistanceMatrixResponse } from "@google/maps";

export function getGoogleDistanceMatrixMock(getValue: () => number) {
  return jest.fn(() => {
    return {
      asPromise: () =>
        Promise.resolve<ClientResponse<DistanceMatrixResponse>>({
          headers: {},
          json: {
            destination_addresses: [],
            error_message: "",
            origin_addresses: "",
            rows: [
              {
                elements: [
                  {
                    distance: { value: 150, text: "150" },
                    duration: {
                      text: "150",
                      value: getValue()
                    },
                    duration_in_traffic: { value: 150, text: "150" },
                    fare: { value: 150, text: "150", currency: "EUR" },
                    status: "OK"
                  }
                ]
              }
            ],
            status: "OK"
          },
          status: 200
        }),
      cancel: () => {
        // empty block
      },
      finally: () => null
    };
  });
}
