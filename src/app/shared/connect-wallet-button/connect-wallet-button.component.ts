import { Component, NgZone, OnInit } from '@angular/core';
import { WalletService } from "../../services/wallet.service";
import { ethers } from 'ethers';
import DBase from '../../../assets/db.json'


@Component({
  selector: 'app-connect-wallet-button',
  templateUrl: './connect-wallet-button.component.html',
  styleUrls: ['./connect-wallet-button.component.scss']
})
export class ConnectWalletButtonComponent implements OnInit {

  public contractAddress = "0xA54205CdDac10e7f66F600758ae5f9119883ed81";
  public ABI = DBase.abi;
  walletAddress: any;

  constructor(
    private walletService: WalletService,
    private _ngZone: NgZone
  ) {
    console.log('Reading local json files');
    console.log(this.ABI);
    console.log(this.contractAddress);
  }

  async ngOnInit() {
    this.walletService.getWalletSubject().subscribe(async (walletAddress) => {
      this._ngZone.run(() => {
        this.walletAddress = walletAddress
      });
    });
  }

  async connectWallet() {
    this.walletAddress = await this.walletService.connectWallet()
  }

  async disconnectWallet() {
    await this.walletService.disconnectWallet()
  }

  getShrinkWalletAddress() {
    return this.walletAddress.replace(this.walletAddress.substring(4, (this.walletAddress ? this.walletAddress.length : 42) - 4), "...")
  }


  async mintNftHandler() {
    try {
      const { ethereum }: any = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(this.contractAddress, this.ABI, signer);

        console.log("Initialize payment");
        let nftTxn = await nftContract.mintNFTs(1, { value: ethers.utils.parseEther("0.001") });

        console.log("Mining ... please wait");
        await nftTxn.wait();

        console.log(`Mined,see transaction:https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object does not exist");
      }

    }
    catch (err) {
      console.log(err);
    }

  }
}
