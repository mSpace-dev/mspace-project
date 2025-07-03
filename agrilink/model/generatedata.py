import pandas as pd
import numpy as np
import random

# Set seed
np.random.seed(42)

# Define parameters
n_samples = 100_000
crops = ['Carrot', 'Tomato', 'Onion', 'Beans', 'Pumpkin']
districts = ['Colombo', 'Dambulla', 'Jaffna', 'Kandy', 'Galle']
weather_types = ['Sunny', 'Rainy', 'Cloudy']
days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

# Generate random dates within 3 years
dates = pd.date_range(start='2022-01-01', end='2024-12-31')
date_choices = np.random.choice(dates, n_samples)

# Convert for weekday lookup
date_choices_timestamps = pd.to_datetime(date_choices)
day_of_week_list = [days_of_week[d.weekday()] for d in date_choices_timestamps]

# Generate features and targets
data = {
    'Date': date_choices,
    'Crop': np.random.choice(crops, n_samples),
    'District': np.random.choice(districts, n_samples),
    'DayOfWeek': day_of_week_list,
    'Weather': np.random.choice(weather_types, n_samples),
    'Supply': np.random.randint(300, 1200, n_samples),
    'Prev_Price': np.random.randint(60, 200, n_samples),
    'Prev_Demand': np.random.randint(200, 1000, n_samples),
    'Festival_Week': np.random.choice([0, 1], n_samples, p=[0.9, 0.1]),
    'Retail_Price': np.random.randint(70, 220, n_samples)
}

# Targets
price_fluctuation = np.random.normal(0, 10, n_samples)
demand_fluctuation = np.random.normal(0, 50, n_samples)

data['Price'] = (0.3 * data['Prev_Price'] + 0.4 * (np.array(data['Supply']) / 10) + 
                 0.3 * np.array(data['Retail_Price']) / 2 + price_fluctuation).astype(int)

data['Demand'] = (0.5 * np.array(data['Prev_Demand']) + 
                  0.3 * (1200 - np.array(data['Supply'])) + 
                  0.2 * (200 - np.array(data['Price'])) + demand_fluctuation).astype(int)

df = pd.DataFrame(data)

# Clip to avoid negative values
df['Price'] = df['Price'].clip(lower=40)
df['Demand'] = df['Demand'].clip(lower=100)

# Save to CSV
df.to_csv("agri_price_demand_data.csv", index=False)
print("✅ Dataset saved to agri_price_demand_data.csv")
