# GlamorByBee Bash Scripts

Collection of utility scripts for managing the GlamorByBee project.

## 📋 Available Scripts

### `setup_project.sh`
Complete project setup - installs dependencies and generates test data.
```bash
./bash_scripts/setup_project.sh
```

### `install_dependencies.sh`
Installs required Python packages (openpyxl).
```bash
./bash_scripts/install_dependencies.sh
```

### `generate_data.sh`
Generates dummy data (Excel + JSON files) for testing.
```bash
./bash_scripts/generate_data.sh
```

### `start_server.sh`
Starts the Python HTTP development server on port 8000.
```bash
./bash_scripts/start_server.sh
```

### `clean_data.sh`
Removes all generated test data files.
```bash
./bash_scripts/clean_data.sh
```

## 🚀 Quick Start

1. **First time setup:**
   ```bash
   chmod +x bash_scripts/*.sh
   ./bash_scripts/setup_project.sh
   ```

2. **Start development:**
   ```bash
   ./bash_scripts/start_server.sh
   ```

3. **Visit:** http://localhost:8000

## 📝 Notes

- All scripts should be run from the project root directory
- Python 3 must be installed on your system
- Scripts will check for required dependencies before running

## 🐝 GlamorByBee
Professional Makeup Artistry - 2025
