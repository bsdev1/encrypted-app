# LockGuard App - Share Encrypted Messages and Files in Real-Time! 📨🔒📂

LockGuard is a user-friendly app that lets you securely share encrypted messages and files in real-time. Built with Socket.IO, Vue, and vanilla JavaScript, it prioritizes your privacy and keeps your sensitive information protected. Say goodbye to intercepted conversations and data breaches.

## Features ✨🚀

- **Real-time Communication**: Experience instant and synchronized communication between devices, allowing you to share messages and files effortlessly.

- **End-to-End Encryption (E2EE)**: Your data is shielded with the highest level of security using AES256 encryption. Feel confident that only you can access your content.

- **Auto Message Destruction**: Enjoy the convenience of setting a self-destruct timer for your messages. After a specified time, your messages automatically vanish, leaving no trace behind.

- **Export Messages**: Capture important conversations by exporting them to your local storage. You can conveniently access and refer to these conversations whenever necessary.

# Getting Started 🚀

To launch LockGuard, follow these steps:

1. Make sure you have Node.js installed on your system. You can download it from [https://nodejs.org](https://nodejs.org).

2. Open a terminal and navigate to the frontend folder.

3. Run the following command to install the necessary dependencies:

   ```
   yarn install
   ```

   Note: If you don't have Yarn installed, you can install it globally by running `npm install -g yarn` before executing the above command.

4. Start the Vue app by running the following command:

   ```
   yarn serve
   ```

5. Open another terminal window and navigate to the backend folder.

6. Run the following command to install the backend dependencies:

   ```
   yarn install
   ```

7. Start the backend server by running the following command:

   ```
   yarn dev
   ```

8. Open your browser and visit [http://localhost:8080](http://localhost:8080) to view the application.

## Deployment 🌐

To deploy LockGuard to your hosting server, follow these steps:

1. **Frontend Setup**:

- Navigate to the **frontend** folder.
- Update the `VUE_APP_BACKEND` environment variable in the `.env` file to your domain where application will be hosted.
- Update the `VUE_APP_SITE_KEY` environment variable in the `.env` file to your hCaptcha site key for that domain.
- Build the app by running the following command:

  ```
  yarn build
  ```

2. **Deploying the Application**:

- Set the `captchaSecret` environment variable to your hCaptcha secret.
- Set the `enableRegister` environment variable to `1` or `0`, depending on whether you want to allow users to register.
- Set the `sessionSecret` environment variable to a randomly generated session secret. This secret is used to sign cookies for secure session management. Make sure to keep this secret confidential.
- Set the `mongoUrl` environment variable to the database URL of your MongoDB.
- Set the `NODE_ENV` environment variable to `production` to change the application to production mode.
- Copy the **dist** folder from the **frontend** build.
- Paste the copied **dist** folder into the **public** folder of the **backend** folder.
- Copy the **backend** folder and place it onto your hosting server or cPanel.
- For more detailed instructions on deploying a Node.js application, you can follow the [Node.js deployment tutorial](https://gist.github.com/bradtraversy/cd90d1ed3c462fe3bddd11bf8953a896).
- Inside the **backend** folder, run the following commands to install the necessary dependencies and start the application:

  ```
  yarn install
  ```

  ```
  yarn start
  ```

Access LockGuard by visiting the appropriate URL in your browser.

## License 📝

MIT License

This application, including its source code, is made available under the following terms and conditions:

1. Permissions: You are granted permission to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this application, subject to the following conditions:

   - You must include the original copyright notice and this license in all copies or substantial portions of the application.
   - If you modify the source code, you must clearly indicate the changes made.

2. Attribution: When using this application or its source code, you are required to provide proper attribution by mentioning the original author in a visible and appropriate manner.

3. Warranty: This application is provided "as is," without warranty of any kind, express or implied. The author shall not be liable for any claim, damages, or other liability arising from the use of the application.

By using this application or its source code, you agree to abide by the above terms and conditions.
