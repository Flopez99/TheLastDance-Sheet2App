// Have to show refernces. currently sets it up in the db but does not show it,
//as it is objectid type not string/
import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios'
import { useMemo, useRef } from "react";
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom'
import {Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@mui/material';

const siteURL = process.env.SITE_URL || 'http://localhost:8080';

const columns  = [
    {
      field: 'name',
      headerName: 'Column  name',
      width: 150,
      flex: 1,
  
    },
    {
      field: 'key',
      headerName: 'Key',
      width: 110,
      editable: true,
      type: 'boolean',
      flex: 1,
    },
    {
      field: 'initial_value',
      headerName: 'Initial Value',
      width: 150,
      editable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'label',
      headerName: 'label',
      type: 'boolean',
      width: 80,
      editable: true,
      flex: 1
    },
    {
      field: 'references',
      headerName: 'reference',
      type: 'string',
      width: 110,
      editable: true,
      flex: 1,
    },
    {
      field: 'type',
      headerName: 'type',
      type: 'string',
      width: 110,
      editable: true,
      flex: 1
    },
  ];
  //Taken from stack overflow used to read data from datagrid
  function useApiRef() {
    const apiRef = useRef(null);
    const _columns = useMemo(
      () =>
        columns.concat({
          field: "__HIDDEN__",
          width: 0,
          renderCell: (params) => {
            apiRef.current = params.api;
            return null;
          }
        }),
      [columns]
    );
  
    return { apiRef, columns: _columns };
    }



function EditDataSource({datasource_id, appId}) {
const navigate = useNavigate();
  console.log("Hi")
  console.log(datasource_id)
  const { apiRef, columns } = useApiRef();
  const [datasource, setDatasource] = useState({})
  const [datasource_name, setDatasource_name] = useState("")
  const [labelError, setLabelError] = useState(false)
  const [typeError, setTypeError] = useState(false)
  const [referenceError, setReferenceError] = useState(false)
  const [rows1, setRows1] = useState({})
  const [keyError, setKeyError] = useState(false)
  const [app, setApp] = useState({})
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const theme = createTheme();

  useEffect(async () => {
    console.log("In Use Effect")
    await axios.get(`${siteURL}/datasource`, { params: {
        id: datasource_id
    }})
    .then(async (res) =>{
        console.log("Got Datasource")
        console.log(res.data)
        setDatasource(res.data)
        setDatasource_name(res.data.name)
        console.log(res.data.name)
        var sheet_url = res.data.url;
        //var sheetIndex = res.data.sheet_index
        var rows1 = [];
        var count = 0;
        for(const column of res.data.columns){
            if(res.data.key === column._id)
              rows1.push({id: count, key:true, reference_id: null,  ...column})
            else
              rows1.push({id: count, key:false, reference_id: null, ...column})
            count++;
            if(!(column.references === null || column.references === undefined )){
              console.log(column.references)
              rows1[count - 1].references = column.references?.name || ''
              console.log('REFERNCE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
              console.log(rows1[count -1])
            }
            console.log(rows1.references !== undefined)
        }

        await axios.get(`${siteURL}/api/fetchSheetData` , {params : {
            sheet_url: sheet_url
        }})
        .then(async (res) => {
            console.log(res.data.values)
            const headers = res.data.values[0];
            console.log(headers);
            const actual_rows = await generateRows(headers, rows1)
            console.log(actual_rows)
            setRows1(actual_rows);
        })
      await axios.get(`${siteURL}/app`, { params: {
          id: appId
      }})
      .then((res) =>{
          setApp(res.data)
      })

    })
  }, []);
  function checkLabel(array){
    var label_row;
      var count = 0;
      array.forEach((row) => {
        if(row.value.label === true){
          label_row = row.value;
          count++;
        }
      })
      console.log(count)
      if(count != 1){
        setLabelError(true)
        return null
      }
      else{
        setLabelError(false)
        return label_row
      }
  }
  function checkKey(array){
    var key_row;
      var count = 0;
      array.forEach((row) => {
        if(row.value.key === true){
          key_row = row.value;
          count++;
        }
      })
      console.log(count)
      if(count !== 1){
        setKeyError(true)
        return null
      }
      else{
        setKeyError(false)
        return key_row
      }
  }
  function checkType(array){
    let flag = true;
    array.forEach((row) =>{
      if(row.value.type === "Boolean")
        return;
      if(row.value.type === "Number")
        return;
      if(row.value.type === "Text")
        return;
      if(row.value.type === "URL")
        return;
      flag = false;
    })
    setTypeError(!flag) 
    return flag
  }
  const handleRowUpdate = (newRow, oldRow) => {
    console.log(newRow)
    console.log(oldRow)
    return newRow;
  };
  async function checkReference(array){
    let flag = true;
    var datasources = app.data_sources

    for(let column of array){
      if(column.value.references !== undefined &&  column.value.references !== "" && column.value.references !== null){
        var ref_datasource = datasources.find(datasource => datasource.name === column.value.references)
        console.log(ref_datasource)
        console.log(column.value.references)
        if(ref_datasource !== undefined){
          console.log(ref_datasource)
          column.value.reference_id = ref_datasource._id
        }
        else{
            setReferenceError(true)
            flag = false;
        }
      }
    }
    return flag;

  }
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  const handleUpdate = async() => {
    var rowModel = await apiRef.current.getRowModels()
    var array =   Array.from(rowModel, ([key, value]) =>({value}));
    //check if multiple Label
    var boolFlag = true
    boolFlag = boolFlag && checkType(array);
    var label_row 
    var key_row = checkKey(array)
    if(checkKey(array) === null)
      boolFlag = false;
    if(label_row= checkLabel(array) === null)
      boolFlag = false;

    boolFlag = boolFlag && (await checkReference(array));
    console.log(boolFlag)
    var key_column;
    if  (boolFlag){
        console.log("Key ROw:")
        console.log(key_row)
        let new_columns = []
        console.log(array)
        for await (const column of array){
            if(typeof column.value._id === 'undefined'){
                //new Column
                console.log(column.value)
                //if(column.value.)
                await axios.post(`${siteURL}/column`, {
                    name: column.value.name,
                    initial_value: column.value.initial_value,
                    label: column.value.label,
                    references:  column.value.reference_id,
                    type: column.value.type
                  })
                  .then((res) => {
                    if(column.value.key){
                      key_column = res.data._id
                      console.log(key_column)
                  }
                    new_columns.push(res.data._id)
                  })
            }
            else{
                console.log(column)
                await axios.post(`${siteURL}/updateColumn`, {
                columnId: column.value._id,
                column_data: {
                    name: column.value.name,
                    initial_value: column.value.initial_value,
                    label: column.value.label,
                    references: column.value.reference_id,
                    type: column.value.type
                }
                })
                .then((res) => {
                  if(column.value.key){
                      key_column = column.value._id
                      console.log(column.value._id)
                  }
                })

            }
        }
        
        //creates datasource
        await axios.post(`${siteURL}/updateDatasource`, {
            datasourceId: datasource_id,
            name: datasource_name,
            key: key_column,
            columns: new_columns,
            consistent: true
        })
        .then((res) => {
            navigate("/editApp",{state: appId} )
        })

    }
  }

  const handleDeleteDataSource = () => {
    handleCloseDeleteDialog();

    axios.post(`${siteURL}/delete_datasource`, {datasourceId: datasource_id, appId: appId})
    .then((response) => {
      console.log(response)


      navigate('/editapp', {state: appId})

    }).catch((error) => {
      console.log(error)
    });
  }

  return (
    <ThemeProvider theme={theme}>
    <Container component="main" maxWidth="md">
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
          Edit DataSource
        </Typography>
        <Box component="form" noValidate sx={{ mt: 4 }}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={12}>
              <TextField
                name="datasourcename"
                value={datasource_name}
                onChange={(e) => setDatasource_name(e.target.value)}
                required
                fullWidth
                id="dataSourceName"
                label="Data Source Name"
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                value = {datasource.url}
                required
                fullWidth
                id="spreadsheeturl"
                label="Spread Sheet Url"
                name="spreadsheeturl"
                autoFocus
                InputLabelProps={{
                  shrink: datasource.url ? true : false,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                value={datasource.sheet_index}
                id="sheetindex"
                label="Sheet Index"
                name="sheetindex"
                autoFocus
                InputLabelProps={{
                  shrink: datasource.sheet_index ? true : false,
                }}
              />
            </Grid>
          </Grid>
        </Box>
        {labelError && (<Alert severity="error">Label only allowed for 1 Column!</Alert>)}
        {typeError && (<Alert severity="error">All Columns Should habve A Type. Ex. Text, Boolean, URL, Number!</Alert>)}
        {referenceError && (<Alert severity="error">To use reference must place Google Sheet URL + whitespace + sheetIndex. Reference may not be valid</Alert>)}
        <Box sx={{ height: 400, width: '100%'}}>
        {Object.keys(rows1).length !== 0 && (
            <DataGrid
              rows={rows1}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              processRowUpdate={handleRowUpdate}
            />)}
          </Box>
          <Button
            type="createDataSource"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick = {handleUpdate}
          >
            Update Datasource
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: 'error.main' }}
            onClick={handleOpenDeleteDialog}
          >
            Delete Datasource
          </Button>
      </Box>
    </Container>
    <Dialog
      open={openDeleteDialog}
      onClose={handleCloseDeleteDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Are you sure you want to delete this data source?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Deleting this data source will remove it permanently from the application. This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDeleteDialog} color="primary">
          Cancel
        </Button>
        <Button onClick={handleDeleteDataSource} color="primary" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  </ThemeProvider>
  )
  //dataRows = actual headers from google sheet
  //rows = rows from db
  async function generateRows(dataRows, rows){
    let newRows = []
    let count = 0
    let existingColumns = []
    for(const header of dataRows ){
      let current_row = rows.find(row => row.name === header)
      if(current_row){
        current_row.id = count;
        newRows.push(current_row)
        existingColumns.push(current_row._id)
      }
      else{
          newRows.push({id: count, name: header, 
              initial_value: "", label: false, references: "", type: "" })
      }
      count++;
    }

    //deleting these values from db
    for (const db_column of rows){ //rows that are in the DB
      if(!(existingColumns.includes(db_column._id))){
        console.log(db_column)
        await axios.post(`${siteURL}/delete_column`, {
          columnId: db_column._id
        })
        .then((res) => {
          console.log('GOOOD')
        })
        .catch(()=> {
          console.log('ERROR!!!!!!!!!!!')
        })
      }
    }

    console.log(newRows)
    return newRows;



    // console.log(dataRows)
    // console.log(rows)
    // let size = rows.length
    // let existcolumnindexes = []
    // for(const header of dataRows ){
    //     let doesExistFlag = false;
    //     rows.forEach((column) => {
    //         if(column.name === header){
    //             doesExistFlag = true;
    //             existcolumnindexes.push(column.id)
    //         }
    //     })
    //     if(!doesExistFlag){
    //         console.log("Im here")
    //         rows.push({id: size, name: header, 
    //             initial_value: "", label: false, reference: "", type: "" })
    //         existcolumnindexes.push(size)
    //         size++;
    //     }
    // }
    // console.log(rows)
    // console.log(existcolumnindexes)
    // console.log(size)
    // for(let i = 0; i < size; i++){
    //   if(!(existcolumnindexes.includes(i))){
    //     console.log(i)
    //     rows.splice(i, 1)
    //   }
    // }
    // console.log(rows)
    // return rows;
  }

function getIdFromUrl(url) {
  const regex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
//used chat gpt for this lol, asked it to use regex to get sheet index
function getSheetIdFromString(str) {
  const pattern = /#gid=(\d+)$/;
  const match = str.match(pattern);
  if (match) {
    // If the string ends with '#gid=sheetId', extract the sheetId value
    const sheetId = parseInt(match[1]);
    return sheetId;
  } else {
    // If the string does not end with '#gid=sheetId', return null
    return null;
  }
}


}

export default EditDataSource
