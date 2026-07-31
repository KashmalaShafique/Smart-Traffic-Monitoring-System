import pandas as pd

df = pd.read_csv("traffic_data.csv")

print("Average traffic:", df["vehicle_count"].mean())
print("Max traffic:", df["vehicle_count"].max())
df["hour"] = df["time"].str[:2]
peak = df.groupby("hour")["vehicle_count"].mean()

print(peak)