export const OrderTicketTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <style>
      body {
        font-family: "Open sans", sans-serif;
      }
    </style>
  </head>
  <body>
    <table
      class="container"
      align="center"
      border="0"
      cellpadding="0"
      cellspacing="0"
      style="width: 100%; max-width: 500px; padding: 100px 0"
    >
      <tr>
        <td>
          <div style="border-bottom: 0.5px solid #d9d8da">
            <p style="color: #a227ff; font-size: 20px; font-weight: 500; text-align: center">
              Astray
            </p>
          </div>
          <p style="font-size: 16px; margin-top: 24px">Hi there,</p>
          <p style="font-size: 16px">
            We hope this message finds you bursting with excitement and can't
            wait for you to have an awesome experience at
            <b>{{eventName}}.</b>
          </p>

          <div style="margin-top: 40px">
            <p style="font-weight: 600; font-size: 16px; color: #a227ff">
              Order Summary
            </p>

            <div>
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                "
              >
                <p
                  style="
                    padding: 0;
                    color: #2b292f;
                    font-size: 14px;
                    font-weight: 400;
                  "
                >
                  Booking ID
                </p>
                <p style="color: #2b292f; font-size: 14px; font-weight: 700; margin-left: 10px">
                  {{bookingId}}
                </p>
              </div>

              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                "
              >
                <p
                  style="
                    padding: 0;
                    color: #2b292f;
                    font-size: 14px;
                    font-weight: 400;
                    margin: 0;
                    text-transform: capitalize;
                  "
                >
                  Ticket - {{ticket}} X {{quantity}}
                </p>
                <p style="color: #2b292f; font-size: 14px; font-weight: 500; margin: 0; margin-left:10px">
                  ₦{{total}}
                </p>
              </div>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin-top: 24px">{{country}} {{state}} - {{address}}</p>
          <p style="padding: 0px">{{start}}</p>
        </td>
      </tr>
      <tr>
        <td style="margin-top: 40px; display: flex; justify-content: center; width: 100%;">
          <div>
            <p>Connecting you to experiences that ignite your soul.</p>
            <p style="font-size: 12px; text-align: center">
              With ❤️ from Astray
            </p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
