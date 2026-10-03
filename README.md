# Student Management — React + Django Authentication

This project now includes **token-based authentication**.

## Project structure

- `frontend/` — React + Vite application
- `backend/` — Django + Django REST Framework API
- `database/` — database notes

## Authentication flow

1. User opens the React application.
2. Login page asks for Django username and password.
3. React sends `POST /api/auth/login/`.
4. Django verifies the credentials.
5. Django returns an authentication token.
6. React stores the token in `localStorage`.
7. Axios automatically sends:
   `Authorization: Token <token>`
8. Django checks the token before allowing access to `/api/students/`.
9. Logout removes the token and returns to the login page.

## Backend setup

From the `backend` folder:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Configure PostgreSQL credentials in:

`backend/config/settings.py`

Then run:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Use the username and password created by `createsuperuser` on the React login page.

## Frontend setup

From the `frontend` folder:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

`http://localhost:5173`

## How to demonstrate authentication

### 1. Before login
The student CRUD page is not shown. The user sees the login page.

### 2. After login
The dashboard displays:

- `● Authenticated`
- logged-in username
- `Logout` button
- authentication information

### 3. Protected API
The backend uses DRF `TokenAuthentication` and `IsAuthenticated`.

Therefore:

- `GET /api/students/` requires a token.
- `POST /api/students/` requires a token.
- `PUT /api/students/<id>/` requires a token.
- `DELETE /api/students/<id>/` requires a token.
- `GET /api/auth/me/` requires a token.
- `POST /api/auth/login/` is public so a user can log in.

### 4. Test with Postman

Login:

```http
POST http://127.0.0.1:8000/api/auth/login/
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

The response contains:

```json
{
  "token": "your_token",
  "user": {
    "id": 1,
    "username": "your_username",
    "email": ""
  }
}
```

Then call:

```http
GET http://127.0.0.1:8000/api/students/
Authorization: Token your_token
```

If you remove the token, Django REST Framework returns `401 Unauthorized`.

This is the important part that demonstrates that the authentication is actually protecting the backend, not just hiding the page in React.
