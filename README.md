# 💚 S Wallet

> **S Wallet** is a blockchain-based digital wallet application that combines a modern web interface, backend APIs, MySQL database services, and Ethereum smart-contract technology.

The project is designed to provide a simple and user-friendly interface for managing wallet accounts, checking ETH and ERC-20 token balances, sending assets, receiving assets, and interacting with blockchain services through the Ethereum Sepolia test network.

---

## 📌 Project Overview

S Wallet is a **full-stack blockchain wallet application** built using:

- React + Vite for the frontend
- Node.js + Express.js for the backend
- MySQL for application-level data storage
- Solidity + Hardhat for blockchain development
- OpenZeppelin for smart-contract components
- Ethereum Sepolia for blockchain testing

The application separates the responsibilities of the frontend, backend, database, and blockchain layers.

---

# ✨ Features

### 👛 Wallet Management

- Create a new wallet
- Import an existing wallet
- Generate wallet accounts
- Display wallet address
- View wallet balances
- Show/hide sensitive wallet information where applicable
- Receive assets using the wallet address

### 💰 Asset Management

- View ETH balance
- View ERC-20 token balance
- Send ETH
- Send ERC-20 tokens
- Receive ETH and tokens
- View transaction-related information

### ⛓️ Blockchain Integration

- Ethereum Sepolia testnet support
- Smart-wallet based asset operations
- ETH transfer support
- ERC-20 token transfer support
- Blockchain balance retrieval
- Smart-contract interaction through the blockchain service
- Blockchain transaction status handling

### 🗄️ Backend & Database

- REST API using Node.js and Express.js
- MySQL database integration
- Student/user management
- Vendor management
- Mint-related records
- Admin transaction records
- Blockchain service integration

---

# 🏗️ System Architecture

The project is divided into four main layers:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                            S WALLET                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐       HTTP / REST       ┌───────────────────┐ │
│  │    FRONTEND     │ ──────────────────────► │      BACKEND      │ │
│  │                 │                         │                   │ │
│  │ React + Vite    │                         │ Node.js + Express │ │
│  │ Wallet UI       │                         │ REST API           │ │
│  └─────────────────┘                         └─────────┬─────────┘ │
│                                                       │           │
│                              ┌────────────────────────┼───────┐   │
│                              │                        │       │   │
│                              ▼                        ▼       │   │
│                    ┌─────────────────┐      ┌──────────────┐ │   │
│                    │  MYSQL DATABASE │      │  BLOCKCHAIN  │ │   │
│                    │                 │      │   SERVICE    │ │   │
│                    │ Users/Students  │      │              │ │   │
│                    │ Vendors         │      │ Contract API │ │   │
│                    │ Mint History    │      │ Balance Read │ │   │
│                    │ Transactions    │      │ Transfers    │ │   │
│                    └─────────────────┘      └───────┬──────┘ │   │
│                                                     │        │   │
│                                                     ▼        │   │
│                                          ┌──────────────────┐│   │
│                                          │ ETHEREUM SEPOLIA ││   │
│                                          │                  ││   │
│                                          │ Smart Wallet     ││   │
│                                          │ Token Contract   ││   │
│                                          └──────────────────┘│   │
│                                                              │   │
└─────────────────────────────────────────────────────────────────────┘


### Architecture Responsibilities

| Layer | Responsibility |
|---|---|
| Frontend | User interface, wallet screens, forms, balances, transaction actions |
| Backend | API requests, validation, application logic, database and blockchain services |
| MySQL | Application-level user, vendor, mint, and transaction records |
| Blockchain | Decentralized wallet, ETH, token, and smart-contract operations |

---

# 🔄 Overall Application Flow

The basic flow of the application is:

```text
                         ┌──────────────┐
                         │     USER     │
                         └──────┬───────┘
                                │
                                ▼
                     ┌────────────────────┐
                     │   React Frontend   │
                     │      + Vite        │
                     └─────────┬──────────┘
                               │
                         API / User Action
                               │
                               ▼
                     ┌────────────────────┐
                     │ Node.js + Express  │
                     │      Backend       │
                     └─────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
           ┌────────────────┐    ┌────────────────────┐
           │ MySQL Database │    │ Blockchain Service │
           └────────────────┘    └──────────┬─────────┘
                                             │
                                             ▼
                                  ┌────────────────────┐
                                  │ Ethereum Sepolia   │
                                  └─────────┬──────────┘
                                            │
                                            ▼
                                  ┌────────────────────┐
                                  │ Smart Wallet /     │
                                  │ Token Contracts    │
                                  └────────────────────┘
```

---

# 👤 Wallet Creation Flow

```text
┌──────────┐
│   User   │
└────┬─────┘
     │
     ▼
┌──────────────────┐
│ Create Wallet    │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Generate Wallet  │
│ Credentials      │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Wallet Address   │
│ Generated        │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ User Verification│
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Wallet Dashboard │
└──────────────────┘
```

The wallet creation process is handled on the client side according to the application's wallet-generation logic. Sensitive wallet credentials should never be exposed unnecessarily.

---

# 📥 Receive Asset Flow

```text
┌──────────────┐
│    Sender    │
└──────┬───────┘
       │
       │ ETH / ERC-20 Token
       ▼
┌──────────────────┐
│ Wallet Address   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Ethereum Sepolia │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Wallet / Contract│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Balance Updated  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Frontend Refresh │
└──────────────────┘
```

---

# 💸 Send ETH Flow

```text
┌──────────┐
│   User   │
└────┬─────┘
     │
     ▼
┌──────────────────────┐
│ Enter Recipient      │
│ Address + ETH Amount │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Frontend Validation  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Backend / Blockchain │
│ Service              │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Ethereum Sepolia     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Smart Wallet         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ ETH Transfer         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Transaction Result   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Frontend Status /    │
│ Updated Balance      │
└──────────────────────┘
```

---

# 🪙 Send ERC-20 Token Flow

```text
┌──────────┐
│   User   │
└────┬─────┘
     │
     ▼
┌──────────────────────┐
│ Select Token         │
│ + Recipient + Amount │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Frontend Validation  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Backend / Blockchain │
│ Service              │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Ethereum Sepolia     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Smart Wallet         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ ERC-20 Token         │
│ Transfer             │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Blockchain           │
│ Confirmation         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Updated Token Balance │
└──────────────────────┘
```

---

# 📊 Balance Retrieval Flow

## ETH Balance

```text
┌─────────────────┐
│ React Frontend  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend /       │
│ Blockchain      │
│ Service         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Ethereum Sepolia│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Wallet /        │
│ Smart Contract  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ETH Balance     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Dashboard       │
└─────────────────┘
```

## ERC-20 Token Balance

```text
┌─────────────────┐
│ React Frontend  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Blockchain      │
│ Service         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Token Contract  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Token Balance   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Dashboard       │
└─────────────────┘
```

---

# 🗄️ Database Flow

MySQL is used for **application-level data**. Blockchain state remains on the blockchain.

```text
┌─────────────────┐
│ React Frontend  │
└────────┬────────┘
         │
         │ API Request
         ▼
┌─────────────────┐
│ Express Backend │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ MySQL Database  │
└────────┬────────┘
         │
    ┌────┼─────┬──────────────┐
    ▼    ▼     ▼              ▼
┌──────┐ ┌───────┐ ┌──────────┐ ┌─────────────────┐
│Users │ │Vendors│ │Mint      │ │Admin            │
│/     │ │       │ │History   │ │Transactions     │
│Students│       │ │          │ │                 │
└──────┘ └───────┘ └──────────┘ └─────────────────┘
```

---

# 🔗 Backend ↔ Blockchain Flow

The backend's blockchain service provides the application with blockchain-related operations.

```text
┌─────────────────┐
│ React Frontend  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Express API     │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ Blockchain Service   │
└────────┬─────────────┘
         │
    ┌────┼───────────────┐
    │    │               │
    ▼    ▼               ▼
┌──────┐ ┌─────────────┐ ┌─────────────────┐
│ETH   │ │ERC-20       │ │Contract         │
│Balance│ │Balance /    │ │Interaction      │
│      │ │Transfer     │ │                 │
└───┬──┘ └──────┬──────┘ └────────┬────────┘
    │           │                 │
    └───────────┴────────┬────────┘
                         ▼
                ┌──────────────────┐
                │ Ethereum Sepolia │
                └──────────────────┘
```

---

# 🧩 Main Components

### Frontend

The frontend is responsible for:

- Wallet creation UI
- Wallet import UI
- Dashboard
- Balance display
- Send/receive interfaces
- Transaction interface
- Navigation
- User feedback and validation

### Backend

The backend is responsible for:

- REST API
- Database operations
- User/student operations
- Vendor operations
- Blockchain service integration
- Transaction-related application logic
- Server-side validation

### Blockchain Service

The blockchain service is responsible for:

- Connecting to the configured Ethereum network
- Reading blockchain balances
- Interacting with deployed contracts
- Performing blockchain transactions
- Returning blockchain results to the backend

### MySQL

MySQL stores application-level information such as:

- Students/users
- Vendors
- Mint history
- Administrative transactions

### Smart Contracts

The deployed contracts handle blockchain-level operations such as:

- ETH receiving
- ETH transfers
- ERC-20 token transfers
- Contract execution
- Balance reading

The README intentionally does not include the Solidity source code; the contracts are documented here only from an application-flow perspective.

---

# 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Backend | Node.js |
| API | Express.js |
| Database | MySQL |
| Blockchain | Ethereum / EVM |
| Test Network | Ethereum Sepolia |
| Smart Contracts | Solidity |
| Development Framework | Hardhat |
| Smart Contract Library | OpenZeppelin |
| Blockchain Interaction | Ethers.js / Viem |
| Version Control | Git + GitHub |

---

# 📁 Project Structure

```text
Smart_Wallet/
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       └── new.jpg
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── blockchainService.js
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── blockchain/
│   ├── contracts/
│   │   ├── SmartWallet.sol
│   │   └── MockToken.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── hardhat.config.js
│   ├── package.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Smart_Wallet
```

---

## 2. Frontend Setup

Open a terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The Vite development server normally runs at:

```text
http://localhost:5173
```

---

## 3. Backend Setup

Open another terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example` as a reference.

Example:

```env
PORT=5000

DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306

RPC_URL=your_rpc_url
PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=your_contract_address
TOKEN_ADDRESS=your_token_address
```

Start the backend:

```bash
npm start
```

If the project uses a development script:

```bash
npm run dev
```

---

## 4. Blockchain Setup

Open another terminal:

```bash
cd blockchain
```

Install dependencies:

```bash
npm install
```

Compile the contracts:

```bash
npx hardhat compile
```

Deploy to Sepolia:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

After deployment, update the required contract addresses in the backend/frontend environment configuration.

---

# 🌐 Sepolia Testnet

S Wallet uses **Ethereum Sepolia** for blockchain development and testing.

### Setup Process

```text
┌─────────────────────┐
│ Configure RPC URL   │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Configure Wallet    │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Get Sepolia ETH     │
│ for Gas Fees        │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Compile Contracts   │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Deploy Contracts    │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Save Contract       │
│ Addresses           │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Start Backend       │
│ + Frontend          │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Test Transactions   │
└─────────────────────┘
```

Never use a real production private key for testing.

---

# 🔐 Environment Variables

Sensitive values must be stored in `.env` files.

Example:

```env
PORT=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=
RPC_URL=
PRIVATE_KEY=
CONTRACT_ADDRESS=
TOKEN_ADDRESS=
```

### Recommended `.gitignore`

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
build/
coverage/
cache/
artifacts/
```

### Important

Never commit:

- Private keys
- Seed phrases
- Database passwords
- RPC/API secrets
- Authentication secrets
- Production credentials

The repository should contain `.env.example`, not real secret values.

---

# 🧪 Testing

## Frontend

Verify:

- Wallet creation
- Wallet import
- Wallet address
- ETH balance
- Token balance
- Send ETH
- Send tokens
- Receive flow
- Transaction information
- Responsive UI

## Backend

Verify:

- Server starts correctly
- Database connection works
- API endpoints respond correctly
- CORS configuration works
- Blockchain service connects correctly
- Contract addresses are configured

## Blockchain

Compile contracts:

```bash
npx hardhat compile
```

Run tests when test files are available:

```bash
npx hardhat test
```

After deployment, verify blockchain transactions on the Sepolia network.

---

# 🔒 Security

Because S Wallet interacts with blockchain assets and wallet credentials, security is an important part of the project.

### Security Practices

- Never commit private keys.
- Never commit seed phrases.
- Never commit database passwords.
- Never expose private keys in frontend source code.
- Use environment variables for sensitive configuration.
- Validate recipient addresses.
- Validate transaction amounts.
- Verify the selected blockchain network.
- Handle failed blockchain transactions safely.
- Use HTTPS in production.
- Configure CORS for trusted frontend origins.
- Use Sepolia during development.
- Perform a professional smart-contract audit before handling real funds.

---

# 🚀 Deployment Architecture

The project can be deployed as separate services.

```text
                    ┌──────────────────┐
                    │      USERS       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Frontend Hosting │
                    │ React + Vite     │
                    └────────┬─────────┘
                             │
                             │ API Requests
                             ▼
                    ┌──────────────────┐
                    │ Backend Hosting  │
                    │ Node + Express   │
                    └───────┬───┬──────┘
                            │   │
                            │   └────────────────┐
                            ▼                    ▼
                    ┌──────────────┐    ┌─────────────────┐
                    │ MySQL        │    │ Blockchain      │
                    │ Database     │    │ Service         │
                    └──────────────┘    └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │ Ethereum Sepolia │
                                        └──────────────────┘
```

### Possible Hosting

**Frontend**
- Vercel
- Netlify

**Backend**
- Render
- Other Node.js-compatible hosting

**Database**
- Managed MySQL-compatible database

**Blockchain**
- Ethereum Sepolia for testing
- Production EVM network only after proper testing and security review

---

# 🔄 Complete Transaction Lifecycle

This represents the complete lifecycle of a blockchain transaction inside S Wallet:

```text
┌─────────────┐
│    USER     │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ React Frontend   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Express Backend  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Blockchain       │
│ Service          │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Ethereum Sepolia │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Smart Contract   │
│ / Token Contract │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Transaction      │
│ Confirmation     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Backend Response │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Frontend Update  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ User sees result │
└──────────────────┘
```

---

# 📈 Future Enhancements

Possible future improvements include:

- Multi-signature wallet support
- QR-code based payments
- WalletConnect integration
- Multiple blockchain network support
- Gas estimation
- Real-time transaction confirmation
- Improved transaction history
- Token approval management
- Advanced wallet security
- Automated smart-contract testing
- Professional smart-contract auditing
- Production-grade key management
- Mobile application support

---

# 🎯 Project Objective

The main objective of **S Wallet** is to demonstrate how blockchain technology can be integrated into a modern full-stack web application.

The project combines:

```text
React
   +
Node.js / Express
   +
MySQL
   +
Solidity / Hardhat
   +
OpenZeppelin
   +
Ethereum Sepolia
   =
S Wallet
```

The project demonstrates the complete connection between a web-based user interface, backend services, database management, and decentralized blockchain infrastructure.

---

# 📜 License

This project is licensed under the **MIT License**.

---

## 💚 S Wallet

**Blockchain-Based Digital Wallet**

Built with **React, Node.js, Express.js, MySQL, Solidity, Hardhat, OpenZeppelin, and Ethereum Sepolia.**
