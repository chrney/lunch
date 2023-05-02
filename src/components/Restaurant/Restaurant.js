import {useState} from "react";
import {Button, Card, CardContent, List, Typography} from "@mui/material";
import CardActions from "@mui/material/CardActions";
import DishItem from "../DishItem/DishItem";
import {ExpandLess, ExpandMore, VisibilityOff} from "@mui/icons-material";

function Restaurant({restaurant, onClick}) {
    const [showAll, setShowAll] = useState(false);

    const displayedItems = showAll ? restaurant.dishes : restaurant.dishes.slice(0, 3);

    return <Card sx={{mt: "40px"}} elevation={5}>
        <CardContent>
            <Typography variant="h5" component="h2">
                {restaurant.name}
            </Typography>
            <List>
                {
                    displayedItems.map((dish, dishIndex) => (
                        <DishItem key={dishIndex} dish={dish}/>
                    ))
                }
            </List>
        </CardContent>
        <CardActions sx={{justifyContent: 'space-between'}}>
            {restaurant.dishes.length > 3 ? (
                <Button onClick={() => setShowAll(!showAll)} sx={{mt: 1}}>
                    {showAll ? (
                        <ExpandLess/>
                    ) : (<>
                            <ExpandMore/> Visa alla
                        </>
                    )}
                </Button>
            ) : (<div>&nbsp;</div>)}
            <Button color="primary" onClick={onClick}>
                <>
                    Dölj
                    <VisibilityOff sx={{ml: 1}}/>
                </>
            </Button>
        </CardActions>


    </Card>;
}

export default Restaurant;
