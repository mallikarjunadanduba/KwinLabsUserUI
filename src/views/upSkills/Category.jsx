import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Box, Typography, Alert } from "@mui/material";
import { fetchUpSkillsCategories, fetchCourseByCategoryId } from "views/API/UpskillsCategoryApi";

const Categories = () => {
  const [showAll, setShowAll] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user"));
  const headers = {
    "Content-type": "application/json",
    Authorization: "Bearer " + user.accessToken,
  };

  const handleViewAll = () => {
    setShowAll(true);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetchUpSkillsCategories(headers);
      const fetchedData = res.data;
      if (fetchedData) {
        const sortedData = fetchedData.sort((a, b) =>
          a.categoryName.localeCompare(b.categoryName)
        );
        setCategories(sortedData);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryClick = async (categoryId, categoryName) => {
    try {
      const res = await fetchCourseByCategoryId(headers, categoryId);
      const fetchedData = res.data;
      if (fetchedData.length > 0) {
        navigate("courses", { state: { categoryId, categoryName, details: fetchedData } });
      } else {
        setError("No courses found for this category.");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to fetch courses.");
    }
  };

  return (
    <div>
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={2} sx={{ justifyContent: "flex-start" }}>
        {(showAll ? categories : categories.slice(0, 8)).map((category) => (
          <Grid item key={category.categoryId} style={{margin:"10px",alignItems: "flex-start",justifyContent: "flex-start"}}>
            <Box
              component="button"
              onClick={() => handleCategoryClick(category.categoryId, category.categoryName)}
              sx={{
                display: "inline-flex",
                alignItems: "flex-start",
                justifyContent: "flex-start", // Align text to the left
                paddingX: "16px", // Fixed padding for better alignment
                paddingY: "10px", // Fixed height padding
                borderRadius: "50px",
                border: "1px solid #00afb5",
                backgroundColor: "white",
                color: "#00afb5",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.3s ease",
                width: "100%", // Ensure the button takes full width
                textAlign: "left", // Ensure text is left-aligned
                "&:hover": {
                  backgroundColor: "#00afb5",
                  color: "white",
                },
              }}
            >
              {category.categoryName}
            </Box>
           
          </Grid>
        ))}
      </Grid>
      {categories.length > 8 && !showAll && (
        <Box sx={{ textAlign: "initial", mt: 2 }}>
          <Box
            component="button"
            onClick={handleViewAll}
            sx={{
              border: "1px solid #00afb5",
              borderRadius: "50px",
              paddingX: "20px",
              paddingY: "8px",
              backgroundColor: "white",
              color: "#00afb5",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#00afb5",
                color: "white",
              },
            }}
          >
            View All
          </Box>
        </Box>
      )}
    </div>
  );
};

export default Categories;