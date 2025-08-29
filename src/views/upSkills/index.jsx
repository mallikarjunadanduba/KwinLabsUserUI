import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

// project imports
import { gridSpacing } from 'store/constant';
import Banner from 'views/dashboard/Banner';
import Categories from './Category';
import McqCategory from './McqCategory';

// ==============================|| DEFAULT DASHBOARD ||============================== //

const UpSkills = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            <Banner isLoading={isLoading} />
          </Grid>
          <Grid item xs={12}>
            {/* Card Component for Courses */}
            <Card>
              <CardContent style={{ display: 'flex' }}>
                <Typography variant="h5" component="div">
                  Courses
                </Typography>
              </CardContent>
              <Grid item xs={12}>
                <Categories isLoading={isLoading} />
              </Grid>
            </Card>
          </Grid>

          <Grid item xs={12}>
            {/* Card Component for MCQ */}
            <Card>
              <CardContent style={{ display: 'flex' }}>
                <Typography variant="h5" component="div" >
                  MCQ
                </Typography>
              </CardContent>
              <Grid item xs={12}>
                <McqCategory isLoading={isLoading} />
              </Grid>
            </Card>
          </Grid>

        </Grid>
      </Grid>
    </Grid>
  );
};

export default UpSkills;