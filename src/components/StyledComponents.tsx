import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  '& .MuiSlider-root': {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  '& .MuiTypography-root': {
    '&.MuiTypography-h6': {
      marginBottom: theme.spacing(2),
    },
  },
  '& .MuiDivider-root': {
    margin: theme.spacing(2, 0),
  },
  '& .MuiAlert-root': {
    marginBottom: theme.spacing(2),
  },
  '& .MuiCard-root': {
    height: '100%',
  },
})); 