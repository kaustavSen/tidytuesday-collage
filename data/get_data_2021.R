library(tidyverse)
library(magick)

# Get data ----------------------------------------------------------------

tt_data <- read_csv("data.csv", guess_max = 100000)
tt_data_2021 <- tt_data %>% 
  filter(created_at >= lubridate::ymd(20210101), !is_retweet) 

# Filter for 2021 ---------------------------------------------------------

# Keep all participants who had more than 10 posts over the year
tt_participants_2021 <- tt_data_2021 %>% 
  count(screen_name, sort = TRUE) %>% 
  filter(n > 10) %>% 
  pull(screen_name)

profile_image_df <- tt_data_2021 %>% 
  filter(screen_name %in% tt_participants_2021) %>% 
  distinct(screen_name, profile_image_url) %>% 
  mutate(profile_image_url = str_replace(profile_image_url, "_normal", ""))

# Remove "possible" organisation accounts
org_accounts <- c("Chandanrtcs", "dataclaudius", "datavizpyr", "icymi_r", "R4DScommunity", "Rbloggers", "R_Craft_Org", "rstatsvideo", "rweekly_live", "thinkR_fr", "WeAreRLadies")
tt_participants_2021 <- setdiff(tt_participants_2021, org_accounts)
  
# Function to save twitter profile image ----------------------------------

save_image <- function(screen_name, profile_image_url) {
  image <- try(image_read(profile_image_url))
  
  if(class(image) != "try-error") {
      image_write(image, path = paste0("../", "images/", screen_name, ".jpg"), format = "jpg")
  }
}

# Save images on disk -----------------------------------------------------

profile_image_df %>% 
  select(screen_name, profile_image_url) %>% 
  pwalk(~save_image(.x, .y))


# Cleaned data ------------------------------------------------------------

tt_data_2021 %>% 
  select(name, screen_name, favorite_count, retweet_count) %>% 
  filter(screen_name %in% tt_participants_2021) %>% 
  group_by(screen_name) %>% 
  summarise(name = first(name),
            total_likes = sum(favorite_count),
            total_retweets = sum(retweet_count),
            num_posts = n()) %>% 
  mutate(img_url = paste0("images/", screen_name, ".jpg")) %>% 
  write_csv("plot_data.csv")
