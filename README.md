## Database Schema
### Users
> Notes:  
> `discord_id` is stored as a BIGINT but returned as a STRING  
> `coordinates` are LAT,LONG with 1 decimal precision

| Name | Type | Details |
|------|------|---------|
| id   | INT  | Autoincrement field |
| discord_id | BIGINT | User's discord id |
| coordinates | POINT | Lat/Long of user |