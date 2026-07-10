# Job Application Tracker Dashboard

A modern, responsive web application for tracking job applications with a professional dashboard interface. Built with HTML5, CSS3, Bootstrap 5, and vanilla JavaScript.

## Features

### Dashboard
- **Statistics Cards**: View total applications, applied, interviews, rejected, and offers at a glance
- **Interactive Charts**: 
  - Pie chart for application status distribution
  - Bar chart for applications per month
- **Recent Applications**: Quick view of your 5 most recent applications

### Application Management
- **Add Application**: Create new job applications with detailed information
- **Edit Application**: Update existing application details
- **Delete Application**: Remove applications with confirmation modal
- **View Details**: See complete application information in a modal

### Application Fields
- Company Name (required)
- Position (required)
- Location
- Application Date (required)
- Status: Applied, Interview, Rejected, Offer
- Job Type: Full-time, Part-time, Internship, Remote
- Notes

### Search and Filter
- **Search**: Find applications by company name or position
- **Filter**: Filter applications by status
- **Sort**: Sort by newest, oldest, or company name

### Analytics View
- Detailed status distribution chart
- Job type distribution chart
- 12-month application trend chart

### Additional Features
- **Dark/Light Mode**: Toggle between themes with persistence
- **Local Storage**: All data saved locally in your browser
- **Export Data**: Download your applications as JSON
- **Import Data**: Import applications from JSON file
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Empty State**: Friendly message when no applications exist
- **Confirmation Modals**: Prevent accidental deletions

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables
- **Bootstrap 5**: UI framework and responsive grid
- **Bootstrap Icons**: Icon library
- **Chart.js**: Interactive charts
- **Vanilla JavaScript**: No frameworks or dependencies

## Project Structure

```
job-tracker/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Custom styles
├── js/
│   └── app.js          # Application logic
├── assets/             # Static assets (images, etc.)
└── README.md           # This file
```

## Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd job-tracker
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (with http-server)
     npx http-server
     ```
   - Navigate to `http://localhost:8000`

## Usage

### Adding an Application
1. Click the "Add Application" button in the top right
2. Fill in the required fields (Company Name, Position, Application Date)
3. Optionally add location, status, job type, and notes
4. Click "Save Application"

### Managing Applications
- **View Details**: Click the eye icon to see full application details
- **Edit**: Click the pencil icon to modify an application
- **Delete**: Click the trash icon to remove an application (with confirmation)

### Searching and Filtering
- Use the search bar to find applications by company or position
- Select a status from the dropdown to filter applications
- Choose a sort option to order applications
- Click "Clear" to reset all filters

### Analytics
- Navigate to the Analytics view using the sidebar
- View detailed charts and trends
- Analyze your job application patterns

### Data Management
- **Export**: Click "Export" to download your data as JSON
- **Import**: Click "Import" to load data from a JSON file
- Data is automatically saved to Local Storage

### Theme Toggle
- Click the theme toggle button in the sidebar footer
- Choose between Light Mode and Dark Mode
- Your preference is saved automatically

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires modern browser with Local Storage support.

## Data Persistence

All application data is stored in your browser's Local Storage. This means:
- Data persists between browser sessions
- Data is specific to each browser and device
- Clearing browser data will remove your applications
- Regularly export your data as JSON for backup

## Security Notes

- This is a client-side only application
- No data is sent to external servers
- All data remains in your browser
- Export your data regularly for backup

## Customization

### Colors
Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #4f46e5;
    --success-color: #10b981;
    /* ... other variables */
}
```

### Chart Configuration
Modify chart options in `js/app.js` in the respective render functions.

### Adding New Fields
1. Add HTML fields in `index.html` modal
2. Update form handling in `js/app.js`
3. Add CSS styling if needed

## Troubleshooting

### Charts not displaying
- Ensure Chart.js CDN is accessible
- Check browser console for errors
- Verify internet connection for CDN resources

### Data not saving
- Check if Local Storage is enabled in your browser
- Verify browser is not in private/incognito mode
- Check browser console for storage errors

### Styling issues
- Clear browser cache
- Verify Bootstrap CDN is accessible
- Check for CSS conflicts

## License

This project is open source and available for personal and commercial use.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## Support

For issues or questions:
- Check the troubleshooting section
- Review browser console for errors
- Verify all CDN links are accessible

## Future Enhancements

Potential features for future versions:
- Cloud sync integration
- Email notifications
- Calendar integration
- Application reminders
- Advanced analytics
- Custom fields
- Tags and categories
- Application templates
