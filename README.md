# 🌐 TDBuilder

**TDBuilder** is a graphical tool designed to simplify the creation, editing, and visualization of Thing Descriptions (TDs) for cyber-physical systems, following the [W3C Web of Things (WoT)](https://www.w3.org/WoT/) standard.

This tool reduces the learning curve for working with TDs by enabling users to interact intuitively with templates through a visual interface. By incorporating usability principles and enhancing information visibility, TDBuilder improves the user experience and encourages wider adoption of WoT technologies.

---

## 🚀 Features

- Visually create and edit **Thing Descriptions**.
- Expand and collapse JSON structures dynamically.
- View TD data in a structured, readable format.
- **Backedn REST API** to:
  - Register users on first login (with google)
  - Save a user’s TDs
  - List and search a user’s TDs.
  - Delete TDs.


---

## 🧱 Architecture

- **Frontend:** Angular built app served by **Nginx** → http://localhost
- **Backend:** Spring Boot (Temurin JDK 17) → http://localhost:8080/api
- **Database:** PostgreSQL (service name db)

> All protected endpoints live under ```/api/save/**``` (authentication required).
Other routes are denied by default.


---


## 🛠 How to Use

### 1. Clone the repository

```bash
git clone https://github.com/acgtic211/TDBuilder.git
cd TDBuilder
```

### 2. Start the tool with Docker

Make sure you have **Docker** and **Docker Compose** installed.

```bash
docker-compose up --build -d
```

> This will build and run the application in detached mode.

### 3. Open your browser

Once the container is running, access the tool at:

```
http://localhost
```

> TDBuilder runs on **port 80** by default.

---

## 📦 Requirements

- Docker  
- Docker Compose  
- Modern web browser (Chrome, Firefox, Edge...)

---

## 📄 License

MIT License

---

## 🤝 Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss your ideas.

---

## 💬 Contact

For questions or feedback, feel free to open an issue on the repository.
