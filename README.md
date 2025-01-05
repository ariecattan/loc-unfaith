# loc-unfaith

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## notebooks 

### pre-processing


* `notebooks/extract_qasem_verification.ipynb`: prepare data for qasem verification, and filter out inapropriate QAs  

* `notebooks/prepare_data_for_mturk`: prepare batch of HITs


### post-processing

* process batch results -- from entire CSV to multiple json files: `notebooks/load_mturk_results.ipynb`

* compute agreement: `notebooks/compute_iaa.ipynb`


# prod annotations

- v8
- v9
- v12
- v13