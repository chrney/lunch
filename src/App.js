import './App.css';
import {useEffect, useState} from "react";
import Cookies from 'js-cookie';
import {
    Button,
    Card,
    CardContent,
    createTheme,
    CssBaseline,
    Grid,
    InputAdornment,
    TextField,
    ThemeProvider
} from "@mui/material";
import Restaurant from "./components/Restaurant/Restaurant";
import {Search} from "@mui/icons-material";

function App() {

    const theme = createTheme({
        palette: {
            primary: {
                main: '#2196f3', // Replace with your desired primary color
            },

            background: {
                default: '#ddd', // Replace with your desired background color
            },
        },
    });


    const [data, setData] = useState({'shown': [], 'hidden': []})

    useEffect(() => {
        let isSubscribed = true;
        const fetchData = async () => {
            const response = await fetch('https://ywfeegbtpnxdvkzxywrx.supabase.co/storage/v1/object/public/lunch/lunch.json');
            let json = await response.json();
            // set state with the result if `isSubscribed` is true
            if (isSubscribed) {
                const existingValues = (Cookies.get('myCookie') || '').split(',');
                let segmentedList = {...data};
                json.forEach(restaurant => {
                    let key = existingValues.includes(restaurant.id) ? 'hidden' : 'shown'
                    if (!segmentedList[key]) {
                        segmentedList[key] = []
                    }
                    segmentedList[key].push(restaurant)
                })
                setData(segmentedList);
            }
        }

        fetchData()
            .catch(console.error);

        return () => isSubscribed = false;
    }, [data])

    const modifyHiddenList = (item, type) => {
        let existingValues = (Cookies.get('myCookie') || '').split(',');
        let copy = {...data}
        switch (type) {
            case 'add':
                existingValues.push(item.id)
                copy.shown = copy.shown.filter(i => {
                    return i.id !== item.id
                })
                copy.hidden.push(item)
                break;
            default:
                existingValues = existingValues.filter(i => {
                    return i !== item.id
                })
                copy.hidden = copy.hidden.filter(i => {
                    return i.id !== item.id
                })
                copy.shown.push(item)
        }
        Cookies.set('myCookie', existingValues.join(','))
        setData(sortRestaurants(copy))
//        window.scrollTo(0, 0);
    }


    const sortRestaurants = (arrOfObjects) => {
        ['shown', 'hidden'].forEach(segment => {
            arrOfObjects[segment].sort((a, b) => {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });
        })
        return arrOfObjects
    }


    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
        let copy = {...data}
        copy.shown.map(restaurant => {
            restaurant.dishes = restaurant.dishes.filter(dish => {
                return !!(
                    dish.title.toUpperCase().includes(event.target.value.toUpperCase())
                    ||
                    dish.text.toUpperCase().includes(event.target.value.toUpperCase())
                )
            })
            return restaurant
        })
    };


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>

            <div className="App">

                <Grid container spacing={2} sx={{px: 2, py: 2}}>

                    <Grid item xs={12} md={12}>
                        <TextField
                            fullWidth
                            spacing={2}
                            label="Vad söker du idag"
                            variant="outlined"
                            value={inputValue}
                            onChange={handleInputChange}
                            InputProps={{
                                style: {backgroundColor: '#FFFFFF'},
                                endAdornment: (
                                    <InputAdornment position="end">
                                            <Search/>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    {data.shown.map((restaurant, index) => (
                        <>
                            <Grid
                                hidden={restaurant.dishes.length===0}
                                item
                                key={index}
                                xs={12}
                                md={4}
                            >
                                <Restaurant
                                    restaurant={restaurant}
                                    onClick={() => modifyHiddenList(restaurant, 'add')}
                                />
                            </Grid>
                        </>
                    ))}
                </Grid>
                {data.hidden.length && (


                    <Card>
                        <CardContent>
                            <Grid container spacing={2}>
                                {data.hidden.map((item, index) => (
                                    <Grid item key={index}>
                                        <Button onClick={() => modifyHiddenList(item, 'remove')}
                                                variant="contained" color="primary">
                                            {item.name}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>


                )}
            </div>
        </ThemeProvider>

    );
}

export default App;
