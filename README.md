# 👥 Employee Management System

## ⚙️ Tech Stack

### Frontend

- **React 19**
- **Redux Toolkit (RTK)**
- **React Router DOM**
- **Ant Design**
- **Vite**
- **LocalStorage**

### Backend

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT**
- **bcrypt.js**
- **dotenv**
- **Multer**
- **Nodemailer**

---

## 🧰 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/junlianglu/employee-man-system.git
cd employee-man-system
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env    # Replace with your values
npm run dev             # Starts backend server on http://localhost:5001
```

> Example `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/employee_management
PORT=5001
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev             # Starts frontend on http://localhost:5173
```

> Configure your frontend `.env` file to connect with backend:

```
VITE_API_BASE_URL=http://localhost:5001
```

---

### 4. Default URLs

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:5001 |

---

### 5. Notes

- The backend and frontend should run simultaneously.
- Make sure MongoDB is running locally or use a cloud database (MongoDB Atlas).
- You can modify the base URL or ports in the `.env` files.
- Recommended Node.js version: **v18 or later**.
- For email functionality, you'll need to set up Gmail App Password in your `.env` file.

---

## 📁 Frontend Architecture

```
frontend/src/
├── api/                          # API client functions
│   ├── auth.js                  # Authentication endpoints
│   ├── base.js                  # Base API utilities & config
│   ├── documents.js             # Document endpoints
│   ├── employees.js             # Employee endpoints
│   └── registrationTokens.js    # Registration token endpoints
│
├── app/                          # Redux store configuration
│   └── store.js                  # Redux store setup
│
├── components/                   # Reusable React components
│   ├── common/                  # Shared components
│   │   ├── Auth/                # Authentication components
│   │   ├── Documents/           # Document management components
│   │   ├── Forms/               # Form components
│   │   ├── Layout/              # Layout components (Header, Sidebar, Footer)
│   │   ├── Modals/              # Modal components
│   │   ├── Navigation/          # Navigation components
│   │   └── Status/              # Status badges & indicators
│   ├── employee/                # Employee-specific components
│   │   ├── Onboarding/          # Onboarding form components
│   │   ├── PersonalInfo/        # Personal information sections
│   │   └── VisaStatus/          # Visa status components
│   └── hr/                      # HR-specific components
│       ├── EmployeeList/        # Employee list components
│       ├── HiringManagement/   # Hiring management components
│       └── VisaManagement/      # Visa management components
│
├── features/                     # Redux feature slices
│   ├── auth/                    # Authentication state management
│   ├── document/                # Document state management
│   ├── employee/                # Employee state management
│   └── registrationToken/       # Registration token state management
│
└── pages/                        # Page components
    ├── auth/                     # Authentication pages
    ├── employee/                 # Employee pages
    ├── hr/                       # HR pages
    └── shared/                   # Shared pages (404, Unauthorized)
```

**Key Patterns:**

- **Feature-based Redux structure**: Each feature has its own slice, selectors, and thunks
- **Component organization**: Separated into common, employee, and HR-specific components
- **API layer**: Centralized API functions in `api/` directory
- **Protected routes**: Role-based access control via `ProtectedRoute` component

---

## 📁 Backend Architecture

```
backend/
├── config/                       # Configuration files
│   ├── db.js                     # MongoDB connection
│   └── email.js                  # Email service configuration
│
├── controllers/                   # Request handlers
│   ├── authController.js         # Authentication logic
│   ├── documentController.js     # Document CRUD operations
│   ├── employeeController.js     # Employee CRUD operations
│   └── registrationTokenController.js  # Token management
│
├── middlewares/                   # Express middlewares
│   ├── authMiddleware.js         # JWT authentication
│   ├── hrMiddleware.js           # HR role verification
│   └── uploadMiddleware.js       # File upload handling
│
├── models/                        # Mongoose schemas
│   ├── Document.js                # Document model
│   ├── Employee.js                # Employee model
│   └── RegistrationToken.js       # Registration token model
│
├── routes/                        # API route definitions
│   ├── authRoutes.js              # Authentication routes
│   ├── documentRoutes.js         # Document routes
│   ├── employeeRoutes.js         # Employee routes
│   └── registrationTokenRoutes.js  # Token routes
│
├── services/                      # Business logic layer
│   ├── authService.js             # Authentication service
│   ├── documentService.js        # Document service
│   ├── employeeService.js             # Employee service
│   └── registrationTokenService.js  # Token service
│
├── utils/                         # Utility functions
│   └── hashPassword.js           # Password hashing
│
├── scripts/                       # Utility scripts
│   └── seedHR.js                 # HR user seeding
│
├── templates/                     # Document templates
│   ├── I-983-Empty-Template.pdf
│   └── I-983-Sample-Template.pdf
│
├── uploads/                       # Uploaded files storage
├── app.js                         # Express app configuration
└── server.js                      # Server entry point
```

**Key Patterns:**

- **Layered architecture**: Routes → Controllers → Services → Models
- **Middleware pattern**: Authentication and authorization via middlewares
- **Service layer**: Business logic separated from controllers
- **File uploads**: Handled via Multer middleware

---

## 🗄️ Data Modeling

### Models & Relationships

#### 1. **Employee Model**

```javascript
Employee {
  // Authentication
  email: String (unique, required)
  username: String (unique, required)
  password: String (hashed, required)
  isHR: Boolean (default: false)

  // Personal Information
  firstName, middleName, lastName, preferredName
  address: { street, unit, city, state, zip }
  cellPhone, workPhone, ssn
  dateOfBirth, gender

  // Work Authorization
  citizenshipStatus: ['citizen', 'permanent_resident', 'work_visa']
  workAuthorizationType: ['H1-B', 'L2', 'F1(CPT/OPT)', 'H4', 'Other']
  visaTitle: String (required if workAuthorizationType === 'Other')
  visaStartDate, visaEndDate

  // References
  reference: { firstName, middleName, lastName, phone, email, relationship }
  emergencyContacts: [Array of contacts]

  // Relationships
  documents: [ObjectId] → Document (one-to-many)

  // Onboarding
  onboardingReview: {
    status: ['never_submitted', 'pending', 'approved', 'rejected']
    hrFeedback: String
  }
}
```

#### 2. **Document Model**

```javascript
Document {
  employeeId: ObjectId → Employee (many-to-one, required)
  type: ['profile_picture', 'drivers_license', 'work_authorization',
         'opt_receipt', 'opt_ead', 'i983', 'i20']
  fileName: String
  fileUrl: String
  status: ['not_uploaded', 'pending', 'approved', 'rejected']
  hrFeedback: String
  reviewedAt: Date
}
```

#### 3. **RegistrationToken Model**

```javascript
RegistrationToken {
  email: String (required)
  firstName, middleName, lastName: String
  token: String (unique, required)
  registrationLink: String (required)
  sentAt: Date
  expiresAt: Date (required)
  submittedAt: Date (null until used)
}
```

### Relationships

- **Employee ↔ Document**: One-to-Many

  - One Employee can have many Documents
  - Each Document belongs to one Employee (`employeeId` reference)

- **RegistrationToken**: Standalone
  - Used for one-time employee registration
  - Linked by email, not ObjectId reference

---

## ✨ Feature List

### ✅ Implemented Features

#### **Authentication & Authorization**

- [x] User login with JWT authentication
- [x] Token-based registration for new employees
- [x] Role-based access control (Employee vs HR)
- [x] Protected routes with authentication middleware
- [x] Token expiration handling

#### **Employee Features**

- [x] **Dashboard**: Overview of employee information
- [x] **Personal Information Management**:
  - Edit name, contact information, address
  - Upload and manage profile picture
  - Manage emergency contacts
  - View and manage documents (driver's license, work authorization)
- [x] **Onboarding Application**:
  - Multi-step onboarding form
  - Work authorization information
  - Reference information
  - Submit for HR review
- [x] **Visa Status Management** (for OPT employees):
  - Upload OPT Receipt, OPT EAD, I-983, I-20
  - Download template files
  - Track document status and next steps
  - View HR feedback

#### **HR Features**

- [x] **Hiring Management**:
  - Generate registration tokens
  - Send registration links via email
  - View token history
  - Review onboarding applications
  - Approve/reject onboarding with feedback
- [x] **Employee Profiles**:
  - Search and filter employees
  - View employee summary list
  - View detailed employee profiles
  - Review employee documents
- [x] **Visa Status Management**:
  - View employees with incomplete OPT documents
  - Track visa expiration dates
  - Review pending visa documents
  - Approve/reject documents with feedback
  - Send next-step reminder emails
  - View all visa-status employees

#### **Document Management**

- [x] File upload (profile pictures, documents)
- [x] Document preview
- [x] Document download
- [x] Document status tracking (not_uploaded, pending, approved, rejected)
- [x] HR document review workflow

#### **Email Notifications**

- [x] Registration token emails
- [x] Next-step reminder emails
- [x] Onboarding review notifications

#### **UI/UX**

- [x] Responsive design for mobile and tablet
- [x] Real-time search
- [x] Loading states and error handling
- [x] Form validation
- [x] Status badges and progress indicators

### 🚧 Potential Future Enhancements

- [ ] Email notifications for document approval/rejection
- [ ] Document expiration reminders
- [ ] Document version history
