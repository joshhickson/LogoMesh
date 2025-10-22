import re

def main():
    # The list of files to be included in the compendium, as specified in the prompt
    filepaths = [
        "README.md",
        "docs/future-vision.md",
        "docs/IMPLEMENTATION_PLAN.md",
        "docs/06.26.2025 architecture-diagram.md",
        "docs/Agentic Coding Debt Management Research.md",
        "package.json",
        "core/IdeaManager.ts",
        "contracts/storageAdapter.ts",
        "server/src/server.ts",
        "src/App.tsx"
    ]

    # Define the output file
    output_filename = 'logomesh-compendium-updated.txt'

    with open(output_filename, 'w') as outfile:
        for filepath in filepaths:
            try:
                with open(filepath, 'r') as infile:
                    # Write a separator with the file path
                    outfile.write(f'\n--- START OF {filepath} ---\n\n')
                    # Write the content of the file
                    outfile.write(infile.read())
                    # Write a separator at the end of the file
                    outfile.write(f'\n\n--- END OF {filepath} ---\n')
            except FileNotFoundError:
                print(f"Warning: File not found at '{filepath}'. Skipping.")
            except Exception as e:
                print(f"An error occurred with file '{filepath}': {e}")

    print(f"Successfully created '{output_filename}' with the contents of {len(filepaths)} files.")

if __name__ == '__main__':
    main()
