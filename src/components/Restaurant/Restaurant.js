import {forwardRef, useState} from "react";
import {Box, Button, Card, CardContent, List, Typography} from "@mui/material";
import CardActions from "@mui/material/CardActions";
import DishItem from "../DishItem/DishItem";
import {ContentCopy, VisibilityOff} from "@mui/icons-material";
import {CopyToClipboard} from "react-copy-to-clipboard";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Restaurant({restaurant, onClick, searchTerm}) {

    const [open, setOpen] = useState(false);

    const handleCopy = () => {
        console.log('here')
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };


    function generateText(restaurant) {
        let str = [restaurant.name.toUpperCase(), ''];
        restaurant.dishes.forEach(dish => {
            if (dish.text !== '') {
                str.push("*" + dish.title + "* " + dish.text)
            } else {
                str.push(dish.title)
            }
            str.push('')
        })
        str = str.join('\n')
        return str
    }

    return <>
        <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="success" sx={{width: '100%'}}>
                Texten kopierades!
            </Alert>
        </Snackbar>
        <Card sx={{mt: "20px"}} elevation={5}>
            <CardContent>
                <Typography variant="h5" component="h2" color="primary">
                    {restaurant.name}
                </Typography>
                <List>
                    {
                        restaurant.dishes.filter(dish => {
                            return (
                                dish?.title?.toUpperCase().includes(searchTerm?.toUpperCase())
                                ||
                                dish?.text?.toUpperCase().includes(searchTerm?.toUpperCase())
                            );
                        }).map((dish, dishIndex) => (
                            <DishItem key={dishIndex} dish={dish}/>
                        ))
                    }
                </List>
            </CardContent>
            <CardActions>
                <Box display="flex" justifyContent="space-between" width="100%">
                    <CopyToClipboard text={generateText(restaurant)} onCopy={handleCopy}>
                        <Button color="primary">
                            <ContentCopy sx={{mr: 1}} />Kopiera
                        </Button>
                    </CopyToClipboard>
                    <Button color="primary" onClick={onClick}>
                        <>
                            Dölj
                            <VisibilityOff sx={{ml: 1}}/>
                        </>
                    </Button>
                </Box>
            </CardActions>
        </Card>
    </>
}

export default Restaurant;
