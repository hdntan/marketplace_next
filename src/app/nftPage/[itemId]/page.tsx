"use client";


import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {  ethers } from "ethers";
import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
import Marketplace from "../../../../Marketplace.json";
import { useAccount } from "wagmi";
import { Button, Modal } from "antd";
import { showErrorToast, showSuccessToast } from "@/utils/openAlert";

const NftPage = () => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
const [price, setPrice] = useState("");
  const { itemId } = useParams();
  const [data, updateData] = useState<any>({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  const [currAddress, updateCurrAddress] = useState("0x");

  const getNftById = async () => {
    try {
      console.log("type id", itemId.toString());
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();
      let contract = new ethers.Contract(
        Marketplace.address,
        Marketplace.abi,
        signer
      );
      let listedToken = await contract.getListedItedmForId(itemId);
      console.log("item", listedToken);
      // console.log('item by id', listedToken.owner);
      const tokenURI = await contract.tokenURI(listedToken.tokenId);
      let metadata = await axios.get(tokenURI);
      console.log("metadata", metadata, listedToken.tokenId);

      let price = ethers.utils.formatUnits(
        listedToken.price.toString(),
        "ether"
      );
      const id = listedToken.itemId.toString();
      const tkId = listedToken.tokenId.toString();

      let item = {
        price: price,
        itemId: id,
        tokenId: tkId,
        seller: listedToken.seller,
        owner: listedToken.owner,
        image: metadata.data.image,
        name: metadata.data.name,
        description: metadata.data.description,
      };
      updateData(item);
      updateDataFetched(true);
      updateCurrAddress(addr);
    } catch (error) {}
  };

  const buyNft = async () => {
    try {
      setLoading(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(
        Marketplace.address,
        Marketplace.abi,
        signer
      );

      const salePrice = ethers.utils.parseUnits(data.price, "ether");
      let transaction = await contract.executeSale(itemId, {
        value: salePrice,
      });
      await transaction.wait();
      showSuccessToast("You successfully bought the NFT!");
      // alert("You successfully bought the NFT!");
      setLoading(false);

    } catch (error) {
      // alert("Buy Error");
      showErrorToast("Buy Error" + error);
      setLoading(false);

    }
  };

  const changePriceNft = async () => {
    if(!price) {
      showErrorToast("Enter price");
      return

    }
    setIsModalOpen(false);

    try {
      setLoading(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(
        Marketplace.address,
        Marketplace.abi,
        signer
      );
      const salePrice = ethers.utils.parseUnits(price, "ether");
      let transaction = await contract.changePriceItem(itemId,salePrice);
      await transaction.wait();
      showSuccessToast("You successfully change price the NFT!");
     

      setPrice("");
      setLoading(false);

      
    } catch (error) {
      showErrorToast("Buy Error" + error);
      setLoading(false);
    }
  };

  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    changePriceNft();

  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    getNftById();
  }, []);

  return (
    <div className="2xl:container flex items-center justify-center 2xl:mx-auto lg:py-16 lg:px-20 md:py-12 md:px-6 py-9 px-4 ">
      <ToastContainer position="top-right" />
      <Modal title="Change price nft" open={isModalOpen} okType={'default'} onOk={handleOk} onCancel={handleCancel}>
        <p>Price</p>
        <input
                type="number"
                placeholder="price..."
                className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 py-3 mt-3"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
              ></input>
      </Modal>

      <div className="flex justify-center items-center lg:flex-row flex-col gap-8">
      
        <div className=" w-full sm:w-96 md:w-8/12  lg:w-6/12  gap-4">
          <div className=" w-full  bg-gray-100 flex justify-center items-center">
            <img src={data.image} alt={data.name} />
          </div>
        </div>

        <div className="  w-full sm:w-96 md:w-8/12 lg:w-6/12 items-center">
          <p className=" focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 font-normal text-base leading-4 text-gray-600">
            NFT#{data.tokenId}
          </p>
          <h2 className="font-semibold lg:text-4xl text-3xl lg:leading-9 leading-7 text-gray-800 mt-4">
            {data.name}
          </h2>

          <div className=" flex flex-row justify-between  mt-5">
            <p className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 font-normal text-base leading-4 text-gray-700 hover:underline hover:text-gray-800 duration-100 cursor-pointer">
              22 reviews
            </p>
          </div>

          <p className=" font-normal text-base leading-6 text-gray-600 mt-7">
            {data.description}
          </p>
          <p className=" font-semibold lg:text-2xl text-xl lg:leading-6 leading-5 mt-6 ">
            {data.price} ETH
          </p>

          <div className="lg:mt-11 mt-10">
            <div className="flex flex-row justify-between">
              <p className=" font-medium text-base leading-4 text-gray-600">
                Seller
              </p>
              <p className=" font-medium text-base leading-4 text-gray-600">
                {data.seller}
              </p>
            </div>
            <hr className=" bg-gray-200 w-full my-2" />
            <div className=" flex flex-row justify-between items-center mt-4">
              <p className="font-medium text-base leading-4 text-gray-600">
                Owner
              </p>
              <p className="font-medium text-base leading-4 text-gray-600">
                {data.owner}
              </p>
            </div>
            <hr className=" bg-gray-200 w-full mt-4" />
          </div>
          {address != data.owner && currAddress != data.seller ? (
            
            <button className="focus:outline-none focus:ring-2 hover:bg-black focus:ring-offset-2 focus:ring-gray-800 font-medium text-base leading-4 text-white bg-gray-800 w-full py-5 lg:mt-12 mt-6" onClick={buyNft}>
              Buy NFT
            </button>
          ) : (
            <div className="">
               <div className=" flex flex-row justify-between items-center mt-4">
              <p className="font-medium text-base leading-4 text-gray-600">
                Update price Nft
              </p>
              <p className="font-medium text-base leading-4 text-gray-600">
               "Your are owner of Nft"
              </p>
            </div>
             
            
              <Button size="large" loading={loading} disabled={loading}  className="mt-5 focus:outline-none focus:ring-2 hover:bg-black focus:ring-offset-2 focus:ring-gray-800 font-medium text-base leading-4 text-white bg-gray-800 w-full " onClick={showModal}>Change Price</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NftPage;
