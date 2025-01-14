import React from 'react'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const siteURL = process.env.SITE_URL || 'http://localhost:8080';

const theme = createTheme();

function CreateApp(props) {
  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      AppName: data.get('App Name'),
      URL: data.get('rolemembershipsheet'),
    });
    // creator: {type: String, required: true},
    // app_name: {type: String, required: true},
    // published: {type: Boolean, required: true},
    // views: [{type:Schema.Types.ObjectId, ref: 'View'}],
    // data_sources: [{type:Schema.Types.ObjectId, ref: 'DataSource'}],
    // role_membership_url: {type:String, required:true}

    await axios.post(`${siteURL}/app`, {
      creator: props.user.email,
      app_name: data.get('App Name'),
      published: false,
      role_membership_url: data.get('rolemembershipsheet')
    })
    .then((res) => {
      console.log(res.data._id)
      navigate("/editapp", {state: res.data._id})
    })
  }; 

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Create App
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit}  sx={{ mt: 3 }}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <TextField
                  name="App Name"
                  required
                  fullWidth
                  id="appName"
                  label="App Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="rolemembershipsheet"
                  label="Role Membership Sheet URL"
                  name="rolemembershipsheet"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Create
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  
  )
}

export default CreateApp
