# Andy Pet Clinic

A modern, responsive web application for managing a veterinary clinic's pet records, vaccinations, and sending reminders to pet owners.

## Features

- **Pet and Owner Management**: Keep track of pets and their owners
- **Vaccination Records**: Record and manage pet vaccinations 
- **Vaccination Dashboard**: View upcoming and overdue vaccinations
- **WhatsApp Integration**: Send vaccination reminders via WhatsApp
- **Responsive Design**: Works on desktop and mobile devices

## Demo

This application is deployed on GitHub Pages: [https://andypetclinc.github.io/vet/](https://andypetclinc.github.io/vet/)

## Technologies Used

- React 18
- TypeScript
- Tailwind CSS
- LocalStorage for data persistence

## Vaccination Types

The application supports the following vaccination types with their reminder intervals:

- **Anti-fleas**: Reminders at 2-month and 3-month intervals
- **Deworming**: Reminders at 2-week and 2-month intervals
- **Viral vaccine**: Reminders at 20-day and 1-year intervals
- **Rabies**: Reminders at 20-day and 1-year intervals

## Local Development

1. Clone the repository
   ```
   git clone https://github.com/andypetclinc/vet.git
   cd vet
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

## Deployment

This project is set up for automatic deployment to GitHub Pages using the gh-pages package.

To deploy:
```
npm run deploy
```

## License

MIT 