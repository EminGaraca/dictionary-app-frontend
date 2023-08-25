import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Alert, Autocomplete, Backdrop, Box, Button, Chip, CircularProgress, Container, Grid, Pagination, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export const Dashboard = () => {
	const [data, setData] = useState([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [pageSize, setPageSize] = useState(30);
	const [isLoading, setIsLoading] = useState(true);
	const [wordInput, setWordInput] = useState('');
	const [synonymInput, setSyonymInput] = useState('');
	const [responseMessage, setResponseMessage] = useState('');
	const [responseStatus, setResponseStatus] = useState('');
	const [alertVisible, setAlertVisible] = useState(false);
	const [allWords, setAllWords] = useState([]);
	const [wordForSearch, setWordForSearch] = useState('');
	const [receivedSynonyms, setReceivedSynonyms] = useState([]);
	const [getSynonymStatus, setSynonymStatus] = useState();
	const [getSynonymMessage, setSynonymMessage] = useState('');
	const [synonymAlertVisible, setSynonymAlertVisible] = useState('hidden');

	const getData = async (currentPage, currentPageSize) => {
		setIsLoading(true);
		await axios
			.get(`https://dictionary-render.onrender.com/api/v1/synonyms/list?page=${currentPage}&pageSize=${currentPageSize}`)
			.then((response) => {
				const { words, allWords, page, totalPages, pageSize } = response.data;
				setData(words);
				setAllWords(allWords);
				setPage(page);
				setTotalPages(totalPages);
				setPageSize(pageSize);
			})
			.catch((err) => {
				console.log(err);
			});
		setTimeout(() => {
			setIsLoading(false);
		}, 1000);
	};

	useEffect(() => {
		getData(page, pageSize);
	}, [page, pageSize]);

	const pageHandler = (_, newPage) => {
		getData(newPage, pageSize);
	};

	const wordInputHandler = (e) => {
		setWordInput(e.target.value);
	};

	const wordSynonymHandler = (e) => {
		setSyonymInput(e.target.value);
	};

	const addButtonStyle = {
		width: '300px',
		height: '55px',
		backgroundColor: '#008b8b',
		':hover': {
			backgroundColor: '#008b8b',
		},
	};

	const getButtonStyle = {
		marginLeft: '10px',
		width: '300px',
		height: '55px',
		backgroundColor: '#008b8b',
		':hover': {
			backgroundColor: '#008b8b',
		},
	};

	const addWordHandler = () => {
		axios
			.post(`https://dictionary-render.onrender.com/api/v1/synonyms/add?word=${wordInput}&synonym=${synonymInput}`)
			.then((response) => {
				if (response.status === 200) {
					setResponseMessage(response.data);
					setResponseStatus('success');
					setAlertVisible(true);
					setAllWords((prevAllWords) => [...prevAllWords, wordInput]);
					getData(page, pageSize);
				}
			})
			.catch((err) => {
				if (err.response.status === 400) {
					setResponseMessage(err.response.data.errorDescription);
					setResponseStatus('error');
					setAlertVisible(true);
				}
			})
			.finally(() => {
				setWordInput('');
				setSyonymInput('');
				setTimeout(() => {
					setAlertVisible(false);
				}, 3000);
			});
	};

	const setWordSynonymHandler = (event, newValue) => {
		setWordForSearch(newValue);
	};

	const getSynonymHandler = () => {
		axios
			.get(`https://dictionary-render.onrender.com/api/v1/synonyms/search/?word=${wordForSearch}`)
			.then((response) => {
				if (response.status === 200) {
					setReceivedSynonyms(response.data);
					setSynonymStatus(response.status);
				}
			})
			.catch((err) => {
				if (err.response.status === 404) {
					setSynonymStatus(err.response.status);
					setSynonymMessage(err.response.data.errorDescription);
					setSynonymAlertVisible('visible');
					setTimeout(() => {
						setSynonymAlertVisible('hidden');
					}, 2000);
				}
			});
	};

	return (
		<div>
			{isLoading && (
				<Backdrop
					sx={{
						color: '#fff',
						zIndex: 10,
					}}
					open={isLoading}
				>
					<CircularProgress style={{ color: '#008b8b' }} />
				</Backdrop>
			)}
			<Container maxWidth="lg">
				<Box
					display="flex"
					flexDirection="column"
					justifyContent="center"
					alignItems="center"
					sx={{
						marginY: '10px',
						padding: '20px',
						boxSizing: 'border-box',
					}}
				>
					<Box
						display="flex"
						flexDirection={{ xs: 'column', md: 'row' }}
						justifyContent="center"
						alignItems="center"
						gap="10px"
						width="100%"
					>
						<TextField
							label="Word"
							sx={{ width: { xs: '300px', md: 'calc(33% - 10px)' } }}
							onChange={wordInputHandler}
							value={wordInput}
						/>
						<TextField
							label="Synonym"
							sx={{ width: { xs: '300px', md: 'calc(33% - 10px)' } }}
							onChange={wordSynonymHandler}
							value={synonymInput}
						/>
						<Button variant="contained" endIcon={<SendIcon />} style={addButtonStyle} onClick={addWordHandler}>
							Add Synonym
						</Button>
					</Box>

					<Box width="400px" margin="0 auto" visibility={alertVisible ? 'visible' : 'hidden'}>
						<Alert severity={responseStatus}>{responseMessage}</Alert>
					</Box>

					<Box
						display="flex"
						flexDirection={{ xs: 'column', md: 'row' }}
						justifyContent="center"
						alignItems="center"
						gap="10px"
						width="100%"
						marginY="20px"
					>
						<Autocomplete
							id="free-solo-demo"
							onChange={(event, newValue) => {
								setWordSynonymHandler(event, newValue);
							}}
							freeSolo
							options={allWords.map((option) => option)}
							renderInput={(params) => <TextField {...params} label="Enter word" sx={{ width: { xs: '300px', md: 360 } }} />}
						/>
						<Button
							variant="contained"
							endIcon={<SendIcon />}
							style={{
								...getButtonStyle,
								marginLeft: { xs: '0', md: '10px' },
							}}
							onClick={getSynonymHandler}
						>
							Get synonym
						</Button>
					</Box>
				</Box>
			</Container>

			<Grid container justifyContent="center" spacing={1} sx={{ mt: 3 }}>
				{getSynonymStatus === 200 && receivedSynonyms ? (
					receivedSynonyms.map((item, index) => (
						<Grid item xs={6} sm={4} md={3} lg={2} key={index}>
							<Chip label={item} color="success" variant="outlined" style={{ color: '#a83264' }} />
						</Grid>
					))
				) : (
					<Box width="400px" margin="0 auto" visibility={synonymAlertVisible}>
						<Alert severity="error">{getSynonymMessage}</Alert>
					</Box>
				)}
			</Grid>

			<Grid container justifyContent="center" spacing={1} sx={{ mt: 3, marginLeft: '50px' }}>
				{data &&
					data.map((item, index) => (
						<Grid item xs={6} sm={4} md={3} lg={2} key={index}>
							<Chip label={item} color="success" variant="outlined" style={{ color: '#008b8b' }} />
						</Grid>
					))}
			</Grid>
			<Grid container justifyContent="center" sx={{ mt: 2 }}>
				<Pagination page={page} count={totalPages} variant="outlined" shape="rounded" onChange={pageHandler} />
			</Grid>
		</div>
	);
};
