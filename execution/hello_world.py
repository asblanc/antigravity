import sys
import os

def main():
    # In a real scenario, we might read from .env
    # api_key = os.getenv("SOME_API_KEY")
    
    name = sys.argv[1] if len(sys.argv) > 1 else "World"
    print(f"Hello, {name}! This is the Execution Layer (Layer 3) speaking.")

if __name__ == "__main__":
    main()
