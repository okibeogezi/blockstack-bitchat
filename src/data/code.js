// All coins where `Name` and `Symbol` are different
// for (let i in c.Data) { let d=c.Data[i]; if (d.Name!==d.Symbol) console.log(`${d.Symbol}, ${d.Name}, ${d.CoinName}`) }

// Get only relevant keys values
// for (let i in c.Data) { let {ImageUrl, Name, Symbol, CoinName, FullName, SortOrder} = c.Data[i]; c.Data[i] = {ImageUrl, Name, Symbol, CoinName, SortOrder:parseInt(SortOrder)} }

// Remove less relevant cryptocurrencies
// for (let i in c.Data) {if(c.Data[i].SortOrder > 100)delete c.Data[i]}