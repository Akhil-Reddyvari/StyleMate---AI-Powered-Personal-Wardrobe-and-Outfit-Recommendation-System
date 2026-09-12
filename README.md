# StyleMate — AI-Powered Personal Wardrobe and Outfit Recommendation System

StyleMate is a personal wardrobe and outfit-recommendation application designed to help users organize their clothes, discover outfit combinations, track what they wear, and build more variety into their everyday styling.

The project is currently being developed as an MVP. Clothing attributes are entered manually for now; automated AI-based clothing attribute detection is planned for a later stage.

## Current Project Status

### Implemented

- Add clothing items to a digital wardrobe
- Edit clothing-item images
- Upload an image for clothing items that do not currently have one
- Store wardrobe items in MongoDB
- Generate a daily outfit recommendation
- Generate alternative outfit recommendations
- Mark an outfit as worn
- Store worn outfits in outfit history
- Store multiple outfits worn on the same day
- Display outfit history grouped by date
- View multiple outfit records for a single day
- Maintain a backend scoring system for outfit-generation logic
- Hide outfit scores from the user-facing interface

### Current Development Approach

The application currently uses **manual clothing-attribute entry** rather than automatic AI attribute detection.

Typical attributes include:

- Category
- Subcategory
- Primary color
- Secondary color
- Pattern
- Style
- Occasion
- Season
- Number of times worn

These attributes are used by the backend recommendation and outfit-generation logic.

## Main Features

### 1. Digital Wardrobe

Users can add clothing items to their wardrobe and store information about each item, including category, colors, pattern, style, occasion, season, image, and wear frequency.

Wardrobe data is stored in MongoDB and retrieved through the FastAPI backend.

### 2. Image Management

The application supports image management for wardrobe items:

- Add an image while creating a clothing item
- Edit or replace an existing clothing-item image
- Upload an image for an item that was initially created without one

Automatic clothing recognition and attribute extraction are not currently implemented.

### 3. Today's Outfit

The application retrieves and displays a daily outfit recommendation through the `/today-outfit` endpoint.

### 4. Alternative Outfit Recommendations

Users can request another outfit when they do not want to wear the currently displayed recommendation. This functionality is handled through the `/next-outfit` endpoint.

The recommendation logic is still being improved to provide better styling quality, variety, and personalization.

### 5. Wear Outfit

Users can mark the currently selected outfit as worn. A new record is created in the outfit-history collection with the user identifier, date, wearing time, and outfit information.

### 6. Multiple Outfits per Day

Each wearing event is stored as a separate outfit-history record. For example:

```text
September 12, 2026

09:00 AM — Outfit 1
02:00 PM — Outfit 2
08:00 PM — Outfit 3
```

All three outfits can be stored independently and displayed together under the same date. Earlier records are not overwritten when another outfit is worn on that day.

### 7. Outfit History

The Outfit History page currently supports:

- Retrieving history records from the backend
- Sorting records by date
- Grouping records by date in the frontend
- Showing multiple outfits for a single date
- Displaying individual outfit records within a selected day
- Calendar-based history navigation

The outfit score is intentionally not displayed to users. The backend may still calculate or use a score internally for recommendation purposes.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- CSS
- Browser-based image upload functionality

Frontend development server:

```text
http://localhost:5173
```

### Backend

- Python
- FastAPI
- Uvicorn
- PyMongo
- MongoDB
- FastAPI CORS middleware

Backend development server:

```text
http://127.0.0.1:8000
```

## High-Level Architecture

```text
React + TypeScript Frontend
            |
            | HTTP requests
            v
       FastAPI Backend
            |
            v
   Recommendation Services
            |
            v
         MongoDB
```

### Main Data Flow

```text
Add Clothing Item
        |
        v
Digital Wardrobe
        |
        v
Outfit Recommendation
        |
        v
Today's Outfit
        |
        v
Wear Outfit
        |
        v
Outfit History
```

## Backend Structure

A simplified backend structure is shown below:

```text
Backend/
│
├── main.py
│
├── app/
│   ├── api/
│   │   ├── wardrobe.py
│   │   ├── test_db.py
│   │   ├── outfit.py
│   │   ├── best_outfit.py
│   │   ├── top_outfits.py
│   │   ├── match_item.py
│   │   ├── today_outfit.py
│   │   ├── next_outfit.py
│   │   ├── wear_outfit.py
│   │   ├── image_upload.py
│   │   └── outfit_history.py
│   │
│   ├── services/
│   │   └── recommendation_service.py
│   │
│   └── database/
│       └── mongodb.py
│
└── venv/
```

The exact structure may change as development continues.

## Current API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Check whether the API is running |
| `GET` | `/wardrobe` | Retrieve wardrobe items |
| `GET` | `/today-outfit` | Retrieve today's outfit recommendation |
| `POST` | `/next-outfit` | Request another outfit recommendation |
| `POST` | `/wear-outfit` | Mark an outfit as worn |
| `GET` | `/outfit-history` | Retrieve worn-outfit history |
| Image-upload route | Image-upload route | Upload or update clothing images |

> Check the current route files for the exact request body and HTTP method of image and wardrobe modification endpoints.

## Database Collections

### `wardrobe`

Stores clothing items and their manually entered attributes.

### `daily_recommendations`

Stores daily outfit recommendations.

### `outfit_history`

Stores outfits that the user has marked as worn. A record may contain:

- `user_id`
- `date`
- `worn_at`
- Outfit information
- Clothing-item references or details

The exact document schema may evolve as the project develops.

## Running the Project Locally

### 1. Start MongoDB

Make sure the configured MongoDB database is accessible.

If MongoDB Atlas is being used, verify that:

- The cluster is running
- The current IP address is allowed
- The MongoDB connection string is correct
- The database credentials are valid

### 2. Start the Backend

Open a terminal in the backend directory:

```powershell
cd C:\Projects\AI-Personal-Stylist\Backend
```

Activate the virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Start FastAPI:

```powershell
uvicorn main:app --reload
```

The API should be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Start the Frontend

Open another terminal in the frontend directory:

```powershell
cd C:\Projects\AI-Personal-Stylist\Frontend
```

Install dependencies if required:

```powershell
npm install
```

Start the frontend development server:

```powershell
npm run dev
```

The frontend should be available at:

```text
http://localhost:5173
```

## Environment Configuration

The backend uses environment-based configuration for database connectivity. A typical `.env` file may contain:

```env
MONGO_URI=your_mongodb_connection_string
```

Do not commit real database credentials, API keys, passwords, or private connection strings to GitHub. Add sensitive files such as `.env` to `.gitignore`.

## Important Product Decisions

### Outfit Score

The backend may continue to calculate an internal outfit score to support recommendation logic. However, the score is intentionally hidden from the user interface because a numerical score could negatively influence a user's confidence or make an outfit appear objectively good or bad.

The product direction is to provide outfit recommendations and useful styling explanations without exposing a judgmental numerical score.

### Multiple Wears per Day

Every wear event should create a new outfit-history document. The system should not update or replace a previous history record merely because another outfit is worn on the same date.

### Manual Attribute Entry

Manual entry is currently used to keep the MVP simple and allow the recommendation system to be developed independently of computer-vision functionality.

## Known Limitations

- Clothing attributes are entered manually
- Recommendation logic is still being improved
- The application currently uses a demo user identifier
- User authentication and multi-user support are not yet fully implemented
- Recommendations may not always reflect advanced personal styling preferences
- The backend scoring system is internal and hidden from the frontend
- Production deployment has not yet been completed
- Error handling and validation will continue to be improved
- Automated clothing detection is planned for a future version

## Future Improvements

- Better color-harmony rules
- Improved outfit variety
- More personalized styling preferences
- Better occasion-based recommendations
- More detailed outfit explanations
- Clothing wear-frequency analysis
- Style insights and wardrobe analytics
- User authentication
- Multi-user wardrobe support
- Improved image management
- Automatic clothing attribute detection
- AI-powered image understanding
- Production deployment
- Automated testing
- Improved API validation and error handling

## Project Vision

StyleMate aims to become a practical personal styling assistant that helps users make better use of the clothes they already own.

Instead of encouraging users to buy more clothes, the application focuses on:

- Understanding the user's existing wardrobe
- Suggesting useful outfit combinations
- Encouraging variety
- Tracking actual clothing usage
- Helping users feel confident in what they wear

## Development Status

**Current milestone:** MVP wardrobe, outfit recommendation, wear tracking, and multi-outfit history functionality.

The next development stages will focus on improving recommendation quality, refining the user experience, and gradually introducing more intelligent clothing analysis.
