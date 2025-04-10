# DevHeatPiroLog

DevHeatPiroLog is a real-time collaborative code editor that allows multiple developers to write and edit code simultaneously. Built using React, Socket.IO, and CodeMirror, it provides a seamless collaborative coding experience for remote teams or pair programming sessions.

## Features

- **Real-time Code Synchronization**: See changes from all collaborators instantly
- **Multiple Language Support**: Syntax highlighting for JavaScript and other languages
- **Room-based Collaboration**: Join specific rooms to collaborate with your team
- **Code Autocompletion**: Intelligent code suggestions as you type
- **Syntax Highlighting**: Beautiful syntax highlighting with the Dracula theme
- **Auto-closing Tags and Brackets**: Automatically close HTML tags and code brackets

## Demo

https://devheatpirolog-production.up.railway.app/

## Screenshots
/var/folders/yc/y9clszgs7cv8j8sy6dwv62zh0000gn/T/TemporaryItems/NSIRD_screencaptureui_C940fs/Screenshot 2025-04-07 at 01.50.08.png

## Technology Stack

- **Frontend**: React.js
- **Real-time Communication**: Socket.IO
- **Code Editor**: CodeMirror
- **Styling**: CSS/SCSS
- **Deployment**: Railway

## Installation

### Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn

### Setup Instructions

1. Clone the repository:
   git clone https://github.com/jash-kapoor/DevHeatPiroLog.git
   cd DevHeatPiroLog

2. Install dependencies:
   yarn install

3. Start the development server:
   yarn start

4. Open your browser and navigate to `http://localhost:3000`

## Usage
1. Create a new room or join an existing one
2. Share the room ID with your collaborators
3. Start coding together in real-time
4. All changes are synced instantly with everyone in the room

## Project Structure

```
DevHeatPiroLog/
├── public/
├── src/
│   ├── components/
│   │   ├── Editor.js        # CodeMirror integration
│   │   └── ...
│   ├── Actions.js           # Socket.IO actions
│   ├── App.js
│   └── ...
├── .gitignore
├── package.json
└── README.md
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Known Issues

- ESLint warnings about dependencies in useEffect hooks - these are handled with ESLint disable comments to maintain the required functionality

### Deployment Notes

When deploying, make sure to set CI=false in your environment variables if you're using a CI/CD pipeline that treats warnings as errors.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [CodeMirror](https://codemirror.net/) for the powerful code editor
- [Socket.IO](https://socket.io/) for real-time communication capabilities
- [React](https://reactjs.org/) for the frontend framework

Project Link: [https://github.com/jash-kapoor/DevHeatPiroLog](https://github.com/jash-kapoor/DevHeatPiroLog)