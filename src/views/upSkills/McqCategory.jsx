import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Button, Box, Alert } from '@mui/material';
import { fetchMcqCategories, fetchMcqByCategoryId } from 'views/API/McqCategoryApi';

const McqCategory = () => {
    const [showAll, setShowAll] = useState(false);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const user = JSON.parse(sessionStorage.getItem('user'));
    const headers = {
        'Content-type': 'application/json',
        Authorization: 'Bearer ' + user.accessToken
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetchMcqCategories(headers);
                const fetchedData = res.data;
                if (fetchedData) {
                    const sortedData = fetchedData.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
                    setCategories(sortedData);
                }
            } catch (error) {
                console.error('Error fetching MCQ categories:', error);
                setError('Failed to fetch MCQ categories.');
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = async (categoryId, categoryName) => {
        try {
            const res = await fetchMcqByCategoryId(headers, categoryId);
            const fetchedData = res.data;
            if (fetchedData.length > 0) {
                navigate('mcqmodule', { state: { categoryId, categoryName, details: fetchedData } });
            } else {
                setError('No MCQs found for this category.');
            }
        } catch (error) {
            console.error('Error fetching MCQs:', error);
            setError('Failed to fetch MCQs.');
        }
    };

    return (
        <div>
            {error && <Alert severity="error">{error}</Alert>}
            <Box display="flex" flexWrap="wrap" gap={1} justifyContent="flex-start" style={{margin:"10px"}}>
                {(showAll ? categories : categories.slice(0, 8)).map((category) => (
                    <Button
                        key={category.categoryId}
                        onClick={() => handleCategoryClick(category.categoryId, category.categoryName)}
                        sx={{
                            border: '1px solid #00afb5',
                            borderRadius: '20px',
                            padding: '5px 15px',
                            textTransform: 'none',
                            color: '#00afb5',
                            backgroundColor: 'transparent',
                            fontSize: '16px',
                            // fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: '#00afb5',color: 'white',
                            }
                        }}
                    >
                        {category.categoryName}
                    </Button>
                ))}
            </Box>

            {categories.length > 8 && !showAll && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={() => setShowAll(true)}>
                        View All
                    </Button>
                </Box>
            )}
        </div>
    );
};

export default McqCategory;
