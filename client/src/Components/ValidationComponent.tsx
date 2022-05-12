import axios from 'axios';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { Button, TextField } from '@mui/material';

export const BASE_URL = "http://localhost:8000/App";

const ValidationComponent = () => {
    const [payload, setPayload] = useState('');
    const [response, setResponse] = useState('');
    async function getData() {
        var p;
        try{
            p = JSON.parse(payload);
            try{
                var response = await axios.post(`${BASE_URL}/Validate`, p);
                setResponse(JSON.stringify(response.data, null, 4));
            }
            catch(error:any){
                setResponse(JSON.stringify((error.response) ? error.response.data : error.message, null, 4));
            }
        } catch(e:any){
            if(e instanceof SyntaxError)
                setResponse(e.message);
        }
      } 
      
    return (
        <div>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 2, padding: 2 }}>
                <TextField sx={{width: 0.4}}
                    label="Request"
                    multiline
                    rows={25}
                    value={payload}
                    onChange={e => setPayload(e.target.value)}
                />
                <Button variant="contained" sx={{marginLeft: 5, marginRight: 5 }} onClick={getData}>Get Component</Button>
                <TextField sx={{width: 0.4}}
                    label="Response"
                    multiline
                    rows={25}
                    value={response}
                    onChange={e => setResponse(e.target.value)}
                />
            </Box>
        </div>
      ); 
}

export default ValidationComponent