# Advocate First Login Password Hashing

## Purpose
Some project and brand advocate accounts are created with a plain-text password during bulk imports. On first login, the API now validates a plain-text password if the bcrypt check fails, then re-hashes the password and marks the account as logged in.

## Behavior
- Applies only to `project_advocate` and `brand_advocate` roles.
- Login flow:
  - If bcrypt check succeeds, login proceeds normally.
  - If bcrypt check fails and the stored password matches the submitted password exactly, the password is hashed and saved.
- The `userLoggedIn` flag is set to `true` for advocate roles on successful login.

## Data Model
- `userLoggedIn` (Boolean, default `false`): Indicates that an advocate has logged in at least once.
