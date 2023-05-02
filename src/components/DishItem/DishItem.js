import {ListItem, ListItemSecondaryAction, ListItemText, Typography} from "@mui/material";

const DishItem = ({dish}) => {
    return (
        <ListItem>
            <ListItemText
                sx={{maxWidth: '90%'}}
                primary={dish.title}
                secondary={dish.text}
            />
            <ListItemSecondaryAction>
                <Typography variant="body1" color="textSecondary">
                    {dish.price}
                </Typography>
            </ListItemSecondaryAction>
        </ListItem>
    );
};

export default DishItem