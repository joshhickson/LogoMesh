import re

def main():
    # Read the list of files from the markdown file
    with open('gemini-research-files.md', 'r') as f:
        content = f.read()

    # Extract file paths using a regular expression
    # This pattern looks for backticks surrounding the file paths
    filepaths = re.findall(r'`([^`]+)`', content)

    # Define the output file
    output_filename = 'logomesh-compendium.md'

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
