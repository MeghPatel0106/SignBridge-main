import pandas as pd
import numpy as np
import string

def clean_and_balance():
    print("Loading dataset...")
    try:
        # Load dataset without header
        df = pd.read_csv('dataset.csv', header=None)
    except FileNotFoundError:
        print("Error: dataset.csv not found!")
        exit()

    print(f"Original row count: {len(df)}")

    # Label is the last column
    # We need to filter for only 'A'-'Z'
    # Assuming label is a string. If it's saved as int ASCII, it might differ, 
    # but based on previous context, labels were saved as characters (e.g. 'a', 'b', 'A').
    # User said "uppercase alphabet A-Z", so we should check if they are A-Z.
    # Note: hand_landmarks.py saved as 'a' (lowercase) or 'A' (uppercase). 
    # I should check the unique values first or enforce uppercase.
    # Since user trained on 'dataset.csv' and printed predictions like 'A', 
    # let's assume labels are characters.
    
    # Let's inspect the last column
    last_col_idx = df.columns[-1]
    
    # Convert to string just in case
    df[last_col_idx] = df[last_col_idx].astype(str)
    
    # Filter for A-Z
    # We'll allow lowercase 'a'-'z' and convert them to uppercase to be safe, 
    # OR strictly follow "Remove all rows where label is not an uppercase alphabet A–Z"
    # But usually datasets might have mixed. Let's just filter for A-Z if strict.
    # User prompt: "Remove all rows where label is not an uppercase alphabet A–Z"
    # This implies if I have 'a', I should probably keep it and make it 'A' or remove it?
    # Context: "when i put my hands down one letter i permanently stired in that ane then new letter is added"
    # In hand_landmarks.py, we saw `key >= ord('a') and key <= ord('z')`. So they are lowercase.
    # But prediction usually displays uppercase.
    # Let's Normalize to Uppercase first, then filter, to be helpful. 
    # OR, if strictly following "label is not an uppercase", I might lose all data if it was saved lowercase.
    # Let's look at `hand_landmarks.py` again... `dataset.csv` was written with `file.write(..., list.append(chr(key)))`.
    # `chr(key)` for 'a' is 'a'. So dataset has lowercase.
    # User request "Remove all rows where label is not an uppercase alphabet A–Z" likely means "I want only alphabets, and treated as uppercase".
    # I will convert to uppercase first, then filter out anything that isn't A-Z.
    
    df[last_col_idx] = df[last_col_idx].str.upper()
    
    valid_labels = list(string.ascii_uppercase)
    
    # Filter
    df_clean = df[df[last_col_idx].isin(valid_labels)]
    
    removed_count = len(df) - len(df_clean)
    print(f"Rows removed (non-A-Z): {removed_count}")
    print(f"Cleaned row count: {len(df_clean)}")
    
    # Balance
    # Group by label
    grouped = df_clean.groupby(last_col_idx)
    
    # Get counts
    counts = grouped.size()
    print("\nCounts per letter before balancing:")
    print(counts)
    
    if counts.empty:
        print("Error: No data left after cleaning!")
        return

    # Target count is the minimum
    target_count = counts.min()
    print(f"\nTarget count per letter: {target_count}")
    
    balanced_dfs = []
    for letter in counts.index:
        group = grouped.get_group(letter)
        # Sample target_count (random state for reproducibility)
        # If we have exactly target_count, it just takes all.
        balanced_group = group.sample(n=target_count, random_state=42)
        balanced_dfs.append(balanced_group)
        
    df_balanced = pd.concat(balanced_dfs)
    
    # Shuffle
    df_balanced = df_balanced.sample(frac=1, random_state=42).reset_index(drop=True)
    
    print("\nFinal counts per letter:")
    print(df_balanced.groupby(last_col_idx).size())
    
    # Save
    df_balanced.to_csv('balanced_dataset.csv', header=False, index=False)
    print(f"\nSaved balanced dataset to 'balanced_dataset.csv' with {len(df_balanced)} rows.")

if __name__ == "__main__":
    clean_and_balance()
