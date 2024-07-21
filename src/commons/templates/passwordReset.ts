export const passwordResetTemplate = `<!DOCTYPE html>
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
          <p style="font-size: 16px; margin-top: 24px">Hi {{name}},</p>
          <p style="font-size: 16px">
            You have asked to reset your password for <b>Astraytickets.com</b>.
          </p>
          <p style="font-size: 16px">
            to reset your password, please click the button below,
          </p>

          <div style="margin-left: auto; margin-right: auto; margin-top: 10px;">
            <a href={{passwordResetLink}}>
                <button style="font-weight: 600; font-size: 16px; background-color: #a227ff; color: #fff; border: none; outline: none; border-radius: 4px; padding: 10px;">
                    Reset Password
                  </button>
            </a>
            
          </div>
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
</html>`;

export const passwordResetConfirmationTemplate = `<!DOCTYPE html>
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
          <p style="font-size: 16px; margin-top: 24px">Hi {{name}},</p>
          <p style="font-size: 16px">
            Your password for <b>Astraytickets.com</b>, has been reset succesfully.
          </p>
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
</html>`;
