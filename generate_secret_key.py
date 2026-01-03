#!/usr/bin/env python3
"""
Generate a secure SECRET_KEY for the GuardTech backend
"""
import secrets

if __name__ == "__main__":
    secret_key = secrets.token_urlsafe(32)
    print("=" * 60)
    print("GuardTech SECRET_KEY Generator")
    print("=" * 60)
    print()
    print("Your new SECRET_KEY:")
    print()
    print(f"  {secret_key}")
    print()
    print("Copy this key and add it to your backend/.env file:")
    print(f"  SECRET_KEY={secret_key}")
    print()
    print("⚠️  Keep this key secret and never commit it to git!")
    print("=" * 60)
