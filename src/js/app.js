App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

      return App.initContract();

    },


  initContract: function() {
    $.getJSON('CentralBank.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var CentralBankArtifact = data;
      App.contracts.CentralBank = TruffleContract(CentralBankArtifact);
    
      // Set the provider for our contract
      App.contracts.CentralBank.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.render();
  });
},

// Setup page content when loaded
  render: function() {
    var centralbankInstance;
    var bankAccount;
    var content = $("#content");

    $("#notCentral").text("");
    $("invalidRole").text("");

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        bankAccount = account;
        $("#accountAddress").html("Account Address: " + account);
      }
    });
 
    // get caller's bank details
    App.contracts.CentralBank.deployed().then(function(instance) {
      centralbankInstance = instance;
      return centralbankInstance.getBalance(bankAccount);
    }).then(function(result) {
        $("#balance").html("Account balance: " + result);
        return centralbankInstance.getBankDetails(bankAccount);
    }).then(function(result){
      $("#bankDetails").html("Bank Name: "+result[0]);
      return App.showSupply();
    }).catch(function(err) {
      console.log(err.message);
      });
    
    // checking caller's role when loading the pages
    // Central bank can only access central bank page
    // Authorized settlement bank can only access settlement bank page
    App.contracts.CentralBank.deployed().then(function(instance) {
        centralbankInstance = instance; 
        return centralbankInstance.isOwner();
    }).then(function(result) {
      if (!result) {
        console.log("Not Central Bank! Not Authorize to access.");
        $("#notCentral").html("ONLY CENTRAL BANK CAN ACCESS THIS PAGE");
        document.getElementById("centralBankContainer").style.display = "none"; 
      }else{
        console.log("Bank role not exist! Not Authorize to access.");
        $("#invalidRole").html("ONLY AUTHORIZED SETTLEMENT BANK CAN ACCESS THIS PAGE");
        document.getElementById("settleBankContainer").style.display = "none"; 
      }
    }).catch(function(err) {
        console.log(err.message);
    });       
    App.contracts.CentralBank.deployed().then(function(instance) {
        centralbankInstance = instance;
        return centralbankInstance.isSigner(web3.eth.defaultAccount);
    }).then(function(result) {
        if (!result){
          console.log("Bank role not exist! Not Authorize to access.");
          $("#invalidRole").html("ONLY AUTHORIZED SETTLEMENT BANK CAN ACCESS THIS PAGE");
          document.getElementById("settleBankContainer").style.display = "none"; 
        }
    }).catch(function(err) {
        console.log(err.message);
    }); 

   content.show(); 
    
  },

  // show the updated amount of total issue and withdraw amount
  // by central bank to settlement bank
  // show on the top of the central bank page
  showSupply: function() {
    App.contracts.CentralBank.deployed().then(function(instance) {
      centralbankInstance = instance;
      return centralbankInstance.getTotal();
    }).then(function(result){
      $("#totalissue").html("Total issued fund: "+result[0]);
      $("#totalrefund").html("Total refunded fund: "+result[1]);
  }).catch(function(err) {
    console.log(err.message);
    });
  },

  // display updated bank balance of given bank
  getBal: function(_addr,position,display) {
      App.contracts.CentralBank.deployed().then(function(instance) {
      centralbankInstance = instance;
      return centralbankInstance.getBalance(_addr);
    }).then(function(result){
      $(position).html(display + result);
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  // reset message fields
  resetHTMLText: function() {
    $("#msg").text("");
    $("#msg1").text("");
    $("#msg2").text("");
    $("#msg3").text("");
    $("#msg4").text("");
    $("#msg5").text("");

  },
  
  // reset form fields
  resetFormText: function(){
    $("#form1").trigger("reset");
    $("#form2").trigger("reset");
    $("#form3").trigger("reset");
    $("#form4").trigger("reset");
    $("#form5").trigger("reset");
  },

  // create new banks by central bank
  addNewBank: function() {
    var centralbankInstance;
    var authorized;
    var content = $("#content");
    var newBankName = $("#newBankName").val();
    var bankAddress = $("#bankAddress").val();
    var bankFund = $("#bankFund").val();

    content.hide();
    App.resetHTMLText();

    App.contracts.CentralBank.deployed().then(function(instance) {
        centralbankInstance = instance;
        //check if bank already exist
        return centralbankInstance.getBankDetails(bankAddress);
    }).then(function(result){
        authorized = result[1];
        if (!(authorized)){
          App.contracts.CentralBank.deployed().then(function(instance) {
            centralbankInstance = instance;
            // create bank details
            return centralbankInstance.createBank(bankAddress,newBankName);
          }).then(function(result) {
              console.log("create new bank account");  
          }).catch(function(err){
              console.log(err.message);
          });
          App.contracts.CentralBank.deployed().then(function(instance) {
              centralbankInstance = instance;   
              // issue fund to new bank
              return centralbankInstance.issueBank(bankAddress,bankFund);
          }).then(function(result){
              console.log("issued fund to new bank");
              App.getBal(App.account,"#balance","Account balance: ");
              $("#msg").html("Bank created! <br> Bank Name: "+ newBankName + "<BR>Bank Address: "+ bankAddress +"<br>Inital Fund: " + bankFund);
              return App.showSupply(); 
          }).catch(function(err) {
              console.log(err.message);
          });
        } else {$("#msg").html("Bank already exist!") ;}
         // end of if result == null
    }).catch(function(err) {
      console.log(err.message);
    });

    App.resetFormText();
    content.show();
  },
  
  // show bank details
  bankInfo: function() {
    var centralbankInstance;
    var bankName;
    var authorized;
  
    var content = $("#content");
    var bankInfo = $("#bankInfo").val();

    content.hide();
    App.resetHTMLText();

    App.contracts.CentralBank.deployed().then(function(instance) {
      centralbankInstance = instance;
      return centralbankInstance.getBankDetails(bankInfo);
    }).then(function(result){
        if (!(result == null)){
          bankName = result[0];
          authorized = result[1];
          if (authorized == true){ //check if the bank is closed or stil active
            display = "Bank Found! <br> Bank Name: "+ bankName + "<BR>Bank Address: "+ bankInfo +"<br> Fund: ";
            App.getBal(App.account,"#balance","Account balance: ");
            App.getBal(bankInfo,"#msg2",display);
          } else {
              if (bankName.length >0) {
                $("#msg2").html("Bank account is closed! <br>Bank Address: "+ bankInfo);
              } else { 
                  $("#msg2").html("Bank account is not exist!"); 
                }
            }
        }    
    }).catch(function(err) {
        console.log(err.message);
    });
    App.resetFormText();
    content.show(); 
  },

  // reopen the bank after it's being closed
  reopenBank: function() {
    var centralbankInstance;
    var authorized;
  
    var content = $("#content");
    var reopenBank = $("#reopenBank").val();
    var reopenAmount = $("#reopenAmount").val();

    content.hide();
    App.resetHTMLText();

    App.contracts.CentralBank.deployed().then(function(instance) {
      centralbankInstance = instance;
      return centralbankInstance.getBankDetails(reopenBank);
    }).then(function(result){
        authorized = result[1];
        console.log("account active? "+ authorized + " account:" + reopenBank+" fund:"+reopenAmount);
        if (authorized == false){  
          App.contracts.CentralBank.deployed().then(function(instance) {
            centralbankInstance = instance;        
            return centralbankInstance.reopenBank(reopenBank);
          }).then(function(result){
              return centralbankInstance.issueBank(reopenBank,reopenAmount); // issue new fund to this bank
          }).then(function(result){
              App.getBal(App.account,"#balance","Account balance: ");
              App.showSupply();
              $("#msg3").html("Bank account is reopened! <br>Bank Address: "+ reopenBank +"<br>Intial Fund: "+reopenAmount);
              console.log("account reopened")
          }).catch(function(err){
              console.log(err.message);
          });
        } else {$("#msg3").html("Reopen failed : Bank account is active!"); }  
    }).catch(function(err){
        console.log(err.message);
    });
      App.resetFormText();
      content.show(); 
    },

  // close the bank by central bank, fund will be withdraw and send back to Central bank account
  // total withdrawn amount to be updated and record
  removeBank: function() {
    var centralbankInstance;
    var balance;
    var content = $("#content");
    var removebankAddress = $("#removebankAddress").val();

    content.hide();
    App.resetHTMLText();

    App.contracts.CentralBank.deployed().then(function(instance) {
      centralbankInstance = instance;
      return centralbankInstance.getBalance(removebankAddress);
    }).then(function(result){
          balance = result;   
          return centralbankInstance.removeBank(removebankAddress);
      }).then(function(result){  
          App.contracts.CentralBank.deployed().then(function(instance) {
          centralbankInstance = instance;   
          return centralbankInstance.withdrawBank(removebankAddress,balance);
          }).then(function(result){
            console.log("remove bank account");
            App.getBal(App.account,"#balance","Account balance: ");
            $("#msg1").html("Close bank success ! <br>Bank address: "+ removebankAddress +"<br>Burnt Amount: "+balance);
            return App.showSupply();
          }).catch(function(err) {
            console.log(err.message);
          }); 
    }).catch(function(err){
      console.log(err.message);
    });
    App.resetFormText();
    content.show(); 
  },

  // transfer fund between settlement bank for their clients
  // mobile number account must be created by recipient bank
  // sender bank can only send to recipient bank whic holds the mobile number account
  // sender bank can only transfer fund not excess their fund balance
  // transfer payment record will be kept
  transferBanks: function() {
    var centralbankInstance;
    var balance;
    var content = $("#content");
    var transferAmount = $("#transferAmount").val();
    var fromBank = App.account;
    var toBank = $("#toBank").val();
    var mobileNum = $("#mobileNum").val();


    content.hide();
    App.resetHTMLText();

    if (fromBank != toBank){
      App.contracts.CentralBank.deployed().then(function(instance) {
        centralbankInstance = instance;
        return centralbankInstance.getMobileNumberBanks(mobileNum);
      }).then(function(result){
          if (result.length == 0) {
            $("#msg4").html("Transfer bank failed : Mobile not exist!");
          } else{ 
            for (var i = 0 ; i < result.length ; i++){
              if (result[i] == toBank){
                App.contracts.CentralBank.deployed().then(function(instance) {
                  centralbankInstance = instance;
                  return centralbankInstance.getBalance(fromBank);
                 }).then(function(result){
                   balance = result;
                   if (balance < transferAmount){
                       $("#msg4").html("Transfer failed : insufficient fund");
                   } else{
                      App.contracts.CentralBank.deployed().then(function(instance) {
                       centralbankInstance = instance;
                       console.log("transfer function : "+fromBank+" "+ toBank + " "+transferAmount);
                        return centralbankInstance.transferBank(fromBank,toBank,transferAmount);
                     }).then(function(result){
                      console.log("Add record function : "+fromBank+" "+ mobileNum + " "+transferAmount);
                        return centralbankInstance.addMobileRecord(mobileNum,fromBank,transferAmount);
                     }).then(function(result){
                       App.getBal(fromBank,"#balance","Account balance: ");
                       console.log("Transfer between bank account");
                       $("#msg4").html("Transfer between bank success !");
                     }).catch(function(err) {
                       console.log(err.message);
                     });
                  } // end of else
                }).catch(function(err){
                   console.log(err.message);
                });
                break;
              } // end if            
            } // end for
            if (i == result.length){
              $("#msg4").html("Transfer bank failed : Mobile is not registered under the recipiant bank!");
            }
          }
      }).catch(function(err){
             console.log(err.message);
      });
    } else {$("#msg4").html("Transfer bank failed : Cannot transfer in the same bank!");}
    App.resetFormText();  
    content.show(); 
  },

  // central bank can top up the settlement bank account fund when the bank is active
  topUpBank: function() {
    var centralbankInstance;
    var balance;
    var content = $("#content");
    var transferAmount = $("#transferAmount").val();
    var toBank = $("#toBank").val();

    content.hide();
    App.resetHTMLText();

    console.log(" top up : "+toBank+" transfer amount : "+transferAmount);
    App.contracts.CentralBank.deployed().then(function(instance) {
        centralbankInstance = instance;
      return centralbankInstance.getBankDetails(toBank);
      }).then(function(result){
          authorized = result[1];
          if (authorized){
            App.contracts.CentralBank.deployed().then(function(instance) {
                centralbankInstance = instance;
              return centralbankInstance.getBalance(App.account);
            }).then(function(result){
              balance = result;
              if (balance < transferAmount){
                  $("#msg4").html("Transfer failed : insufficient fund");
              } else{
                App.contracts.CentralBank.deployed().then(function(instance) {
                  centralbankInstance = instance;
                  return centralbankInstance.issueBank(toBank,transferAmount);
                }).then(function(result){
                    App.getBal(App.account,"#balance","Account balance: ");
                    App.showSupply();
                    console.log("top up bank account");
                    display = "Top up success ! <br>Bank account : "+ toBank + "<br>New balance : ";
                    App.getBal(toBank,"#msg4",display);
                }).catch(function(err) {
                    console.log(err.message);
                });
              } // end of else
            }).catch(function(err){
                console.log(err.message);
            });
        } else {$("#msg4").html("Top up bank failed : Bank is unavailable!");} 
    }).catch(function(err) {
        console.log(err.message);
    });
    App.resetFormText();
    content.show(); 
  },

  // create a mobile number account by settlement bank for their clients
  // a mobile number account can have multiply bank accounts
  addNewMobile: function() {
    var centralbankInstance;
    var balance;
    var content = $("#content");
    var newMobile = $("#newMobile").val();

    content.hide();
    App.resetHTMLText();


      App.contracts.CentralBank.deployed().then(function(instance) {
        centralbankInstance = instance;
        return centralbankInstance.addMobileNumber(newMobile,App.account);
      }).then(function(result){
          console.log("Moible Added");
          $("#msg").html("Add Moible Number success !");
      }).catch(function(err) {
          console.log(err.message);
      });
    App.resetFormText();
    content.show(); 
  },

  // search the bank account lists which hold by a mobile number account
  searchMobile: function() {
    var centralbankInstance;
    var content = $("#content");
    var searchNum = $("#searchNum").val();
    var numList ;

    content.hide();
    App.resetHTMLText();

    App.contracts.CentralBank.deployed().then(function(instance) {
      centralbankInstance = instance;
      return centralbankInstance.getMobileNumberBanks(searchNum);
    }).then(function(result){
        numList = "";
        for (var i = 0 ; i < result.length ; i++){
          numList = numList + result[i] + "<br>" ;
        }
        if (result.length == 0) {
          $("#msg2").html("No bank is registered under this mobile!");
        } else{
          $("#msg2").html("Search result : <br> "+ numList);
        }
    }).catch(function(err) {
        console.log(err.message);
    });
    App.resetFormText();
    content.show(); 
  },

  // the retrieve the payment transaction records of a mobile number account
  // shows the sender bank of the payment and the payment amount
  viewMoibleRecord: function() {
    var centralbankInstance;
    var content = $("#content");
    var viewMobile = $("#viewMobile").val();
    var bankList ;

    content.hide();
    App.resetHTMLText();

    App.contracts.CentralBank.deployed().then(function(instance) {
      centralbankInstance = instance;
      return centralbankInstance.getMobileRecord(viewMobile);
    }).then(function(result){
        bankList = "";
        for (var i = 0 ; i < result[0].length ; i++){
            bankList = bankList + "From Bank address : "+result[0][i]+ " | Amount: "+ result[1][i] + "<br>" ;
        }
        if ((result[0].length == 0) || (bankList.length == 0)) {
          $("#msg5").html("No payment transcation(s) under this mobile!");
        } else{
          $("#msg5").html("Bank Transcation(s) of Mobile Account : <br>"+ bankList);
        }         
    }).catch(function(err) {
        console.log(err.message);
    });
    App.resetFormText();
    content.show(); 
  },

  // remove a mobile number account by it's bank, the bank should be under it's bank list
  removeMobile: function() {
    var centralbankInstance;
    var content = $("#content");
    var removeMobile = $("#removeMobile").val();

    content.hide();
    App.resetHTMLText();

      App.contracts.CentralBank.deployed().then(function(instance) {
        centralbankInstance = instance;
          return centralbankInstance.getMobileNumberBanks(removeMobile);
      }).then(function(result){
          if (result.length == 0) {
              $("#msg1").html("Mobile not found !");
          } else {
              for (var i = 0 ; i < result.length ; i++){
                if (result[i] == App.account){
                  App.contracts.CentralBank.deployed().then(function(instance) {
                    centralbankInstance = instance;
                    return centralbankInstance.removeMobileNumber(removeMobile,App.account);
                  }).then(function(result){
                        console.log("Remove mobile number account by bank : "+ App.account);
                        $("#msg1").html("Close mobile account success !");
                  }).catch(function(err){
                    console.log(err.message);
                  });
                  break;
                } // end of if
              } // end of for
              if (i == result.length){
                $("#msg1").html("You are not authorized to cancel other bank's mobile account!");
              }
            } // end of else          
      }).catch(function(err) {
          console.log(err.message);
      }); // end of App getMobileNumberBanks
    App.resetFormText();
    content.show(); 
  },

}; //end of App

$(function() {
  $(window).load(function() {
    App.init();
  });
});
