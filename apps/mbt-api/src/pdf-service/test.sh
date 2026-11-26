#!/bin/bash
# Quick test script for PDF generator
cd "$(dirname "$0")"
./venv/bin/python3 generator.py --test
