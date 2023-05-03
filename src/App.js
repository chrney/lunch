import './App.css';
import {useEffect, useState} from "react";
import Cookies from 'js-cookie';
import { styled, alpha } from '@mui/material/styles';

import {
    AppBar,
    Button,
    createTheme,
    CssBaseline,
    Grid,
    ThemeProvider,
    Toolbar,
    Typography
} from "@mui/material";
import Restaurant from "./components/Restaurant/Restaurant";
import {
    Search,
    Restaurant as RestaurantIcon
} from "@mui/icons-material";
import InputBase from '@mui/material/InputBase';


const SearchComponent = styled('div')(({ theme }) => ({
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

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
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

    const [data, setData] = useState({'shown': [], 'hidden': []})

    const fetchData = async (day, isSubscribed) => {
        const response = await fetch('https://ywfeegbtpnxdvkzxywrx.supabase.co/storage/v1/object/public/lunch/lunch.json');
        let json = await response.json();
        // set state with the result if `isSubscribed` is true
        json = json[day]
        if (isSubscribed) {
            const existingValues = (Cookies.get('myCookie') || '').split(',');
            let segmentedList = {...data};
            json.list.forEach(restaurant => {
                let key = existingValues.includes(restaurant.id) ? 'hidden' : 'shown'
                if (!segmentedList[key]) {
                    segmentedList[key] = []
                }
                segmentedList[key].push(restaurant)
            })
            setData(segmentedList);
        }
    }
    useEffect(() => {
        let isSubscribed = true;

        fetchData(0, isSubscribed)
            .catch(console.error);

        return () => isSubscribed = false;
    }, [])


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

    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <AppBar position="sticky">
                <Toolbar>
                    <RestaurantIcon sx={{mr: 1}}/>
                    <SearchComponent sx={{mr: 2}}>
                        <SearchIconWrapper>
                            <Search />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Sök maträtt"
                            inputProps={{ 'aria-label': 'search' }}
                            value={inputValue}
                            onChange={handleInputChange}
                        />
                    </SearchComponent>
                    {/*<Button onClick={() => fetchData(1)}>Imorgon</Button>*/}
                </Toolbar>
            </AppBar>
            <div className="App">

                <Grid container spacing={2} sx={{px: 2, py: 2}}>
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
