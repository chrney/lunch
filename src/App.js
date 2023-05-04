import './App.css';
import {useEffect, useState} from "react";
import Cookies from 'js-cookie';
import {alpha, styled} from '@mui/material/styles';

import {AppBar, Button, createTheme, CssBaseline, Grid, ThemeProvider, Toolbar, Typography} from "@mui/material";
import Restaurant from "./components/Restaurant/Restaurant";
import {Restaurant as RestaurantIcon, Search} from "@mui/icons-material";
import InputBase from '@mui/material/InputBase';


const SearchComponent = styled('div')(({theme}) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({theme}) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({theme}) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: "12ch",
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));


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

    const [getTomorrow, setTomorrow] = useState(0)
    const [shownDate, setShownDate] = useState('')
    const toggleDay = () => {
        let newVal = getTomorrow === 0 ? 1 : 0
        setTomorrow(newVal)
        console.log(newVal)
        fetchData(newVal, true)
    }

    const [data, setData] = useState({'shown': [], 'hidden': []})

    const fetchData = async (day, isSubscribedInFn) => {
        const response = await fetch('https://ywfeegbtpnxdvkzxywrx.supabase.co/storage/v1/object/public/lunch/lunch.json');
        let json = await response.json();
        // set state with the result if `isSubscribed` is true
        //if (isSubscribedInFn) {
        setShownDate(json[day].day)
        const existingValues = (Cookies.get('restaurants') || '').split(',');
        let segmentedList = {'hidden': [], 'shown': []};
        json[day].list.forEach(restaurant => {
            let key = existingValues.includes(restaurant.id) ? 'hidden' : 'shown'
            if (!segmentedList[key]) {
                segmentedList[key] = []
            }
            segmentedList[key].push(restaurant)
        })
        console.log(segmentedList)
        setData(segmentedList);
        // }
    }
    useEffect(() => {
        let isSubscribed = true;

        fetchData(0, isSubscribed)
            .catch(console.error);

        return () => isSubscribed = false;
    }, [])


    const modifyHiddenList = (item, type) => {
        let existingValues = (Cookies.get('restaurants') || '').split(',');
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
        Cookies.set('restaurants', existingValues.join(','), {expires: 360})
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

    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <AppBar position="sticky">
                <Toolbar>
                    <RestaurantIcon sx={{mr: 1}}/>
                    <SearchComponent sx={{mr: 2}}>
                        <SearchIconWrapper>
                            <Search/>
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Sök maträtt"
                            inputProps={{'aria-label': 'search'}}
                            value={inputValue}
                            onChange={handleInputChange}
                        />
                    </SearchComponent>
                </Toolbar>
            </AppBar>
            <div className="App">
                <Button
                    variant="contained"
                    color="primary"
                    sx={{mt: 2}}
                    onClick={() => toggleDay()
                    }>Visa lunch för {
                    getTomorrow === 1 ? 'idag' : 'imorgon'}</Button>
                <Grid container spacing={2} sx={{px: 2, py: 2}}>
                    <Grid item xs={6}>
                        <Typography variant="h6" component="h6" sx={{mt: 2}}>
                            Dagens lunch
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h6" component="h6" sx={{mt: 2}}>
                            {shownDate}
                        </Typography>
                    </Grid>
                    {data.shown
                        .filter(restaurant => {
                            return restaurant.dishes.filter(dish => {
                                return (
                                    dish.title.toUpperCase().includes(inputValue.toUpperCase())
                                    ||
                                    dish.text.toUpperCase().includes(inputValue.toUpperCase())
                                );
                            }).length > 0
                        })
                        .map((restaurant, index) => (
                            <Grid
                                item
                                key={index}
                                xs={12}
                                md={4}
                            >
                                <Restaurant
                                    searchTerm={inputValue.toUpperCase()}
                                    restaurant={restaurant}
                                    onClick={() => modifyHiddenList(restaurant, 'add')}
                                />
                            </Grid>

                        ))}

                </Grid>
                {data.hidden.length && (
                    <div>
                        {data.hidden.map((item, index) => (
                            <Typography
                                key={index}
                                variant="body2"
                                color="textSecondary"
                                style={{
                                    textDecoration: "line-through",
                                    cursor: "pointer", marginRight: "16px",
                                    display: "inline-block"
                                }}
                                onClick={() => modifyHiddenList(item, 'remove')}
                            >
                                {item.name}
                            </Typography>

                        ))}
                    </div>
                )}
            </div>
        </ThemeProvider>
    );
}

export default App;
