from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3000")
    time.sleep(5)  # Wait for load
    page.screenshot(path="screenshot.png", full_page=True)
    browser.close()
