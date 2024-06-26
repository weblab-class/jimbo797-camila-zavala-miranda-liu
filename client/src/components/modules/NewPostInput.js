import React, { useState, useRef } from "react";
import { post } from "../../utilities";
import axios from "axios";

import "./NewPostInput.css";
import ImgurUpload from "./ImgurUpload";

/**
 * New Post is a parent component for all input components
 *
 * Proptypes
 * @param {string} defaultText is the placeholder text
 * @param {string} storyId optional prop, used for comments
 * @param {({storyId, value}) => void} onSubmit: (function) triggered when this post is submitted, takes {storyId, value} as parameters (might need to remove from props later!!)
 */
const NewStory = (props) => {
  const [value, setValue] = useState("");
  const [image, setImage] = useState(null); // for Imgur upload
  const [location, setLocation] = useState("");

  var imgId = "";
  const inputFile = useRef(null);

  // when imgur upload made
  const handleImageChange = (event) => {
    // Assuming you have an input field for selecting a file
    const selectedImage = event.target.files[0];
    const filename = event.target.files[0].name;
    setImage(selectedImage);
    const label = document.querySelector("label[for=files");
    label.innerText = filename ?? "Browse Files";
  };

  // called whenever the user types in the new post input box
  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  // upload image to imgur api
  const handleImageUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await axios.post("https://api.imgur.com/3/image", formData, {
        headers: {
          Authorization: "Client-ID 6b1e2512d36fa88", // Replace with your Imgur client ID
        },
      });

      // console.log("Upload successful:", response.data);
      imgId = parseImgurImageId(response.data.data.link);
      // setUploaded(true);
    } catch (error) {
      console.error("Error uploading image:", error);
      // alert("Please upload a .png image!");
      // setUploaded(false);
    }
  };

  // location param format: location = { city, state?, country? }
  // Utilizing the Geocoding API to convert a location to latitude longitude coordinates
  const convertLocation = async (location) => {
    try {
      const response = await axios.get("https://api.api-ninjas.com/v1/geocoding", {
        params: location,
        headers: {
          "X-Api-Key": "P++ZL0Z+VV3YUYrRazvHnA==73PCXJetnMsZmehj",
          // "X-Api-Key": process.env.GEOCODING_KEY,
        },
      });
      // console.log("Upload successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const parseLocation = (location) => {
    const locationArray = location.split(",").map((content) => content.trim());
    if (locationArray.includes("") || locationArray.length > 3) return undefined;

    switch (locationArray.length) {
      case 1:
        return { city: locationArray[0] };
      case 2:
        return { city: locationArray[0], country: locationArray[1] };
      case 3:
        return { city: locationArray[0], state: locationArray[1], country: locationArray[2] };
    }
    return undefined;
  };

  // called when the user hits "Submit" for a new post
  const handleSubmit = async (event) => {
    if (!location) {
      alert("Enter a city");
      return;
    }
    setImage(null);

    const parsedLocation = parseLocation(location);
    if (parsedLocation === undefined) {
      alert(
        'Location input invalid. It should be in the form "Boston", "Boston, Massachusetts", or "Boston, Massachusetts, US"'
      );
      return;
    }
    const results = await convertLocation(parsedLocation);
    if (results.length === 0) {
      alert("Enter a valid city");
      return;
    }

    const locationBody = results[0];

    handleImageUpload().then(() => {
      // if (uploaded) {
      event.preventDefault();

      addStory && addStory(value, locationBody);
      setValue("");
      setImage(null);
      setLocation("");
      // setSelectedLocations([]);

      if (inputFile.current) {
        inputFile.current.value = "";
        inputFile.current.type = "text";
        inputFile.current.type = "file";
      }

      // setUploaded(false);
      // }
    });
  };

  // parse input link for just the image id
  const parseImgurImageId = (imgurImageUrl) => {
    try {
      // Extract the portion after the last slash
      const parts = imgurImageUrl.split("/");
      const fileName = parts[parts.length - 1];

      // Remove the file extension
      const imageId = fileName.split(".")[0];

      return imageId;
    } catch (error) {
      // Handle any parsing errors
      console.error("Error parsing Imgur image ID:", error);
      return null;
    }
  };

  const addStory = (value, location) => {
    const body = { content: value, imgSrc: imgId, location: location };

    post("/api/story", body).then((story) => {
      // display this story on the screen
      props.addNewStory(story);
    });
  };

  const handleMedia = () => {
    return <input type="file" accept="image/*" ref={inputFile} onChange={handleImageChange} />;
  };

  // multiselect
  // const [isMultiSelectPopupOpen, setIsMultiSelectPopupOpen] = useState(false);
  // const [selectedOptions, setSelectedOptions] = useState([]);

  // const openMultiSelectPopup = () => {
  //   setIsMultiSelectPopupOpen(true);
  // };

  // const closeMultiSelectPopup = () => {
  //   setIsMultiSelectPopupOpen(false);
  // };

  // const handleMultiSelect = (selectedValues) => {
  //   setSelectedOptions(selectedValues);
  // };

  return (
    <div>
      {/* <ImgurUpload /> */}
      {/* <input
        type="text"
        placeholder={"New Image"}
        value={values.img}
        onChange={handleChange}
        name="img"
        className="NewPostInput-input"
      /> */}
      <div className="new-post-layout">
        <input
          type="text"
          placeholder={"Share your thoughts on this adventure! What were your favorite parts?"}
          value={value}
          onChange={handleChange}
          name="caption"
          className="new-post-layout"
        />
        </div>
        <div className="changing-layout">
        <div className="flex-display">
          <label className="Image-text" for="files" class="btn">
            Add Image
          </label>
          <input
            id="files"
            type="file"
            accept="image/*"
            ref={inputFile}
            onChange={handleImageChange}
            className="image-input"
          />

          {/* <LocationSelect
        options={possibleLocations.map(loc => ({ value: loc.name, label: loc.name }))}
        value={selectedLocations}
        onChange={handleLocationChange}
      />   */}
          <div className="location-setting">
            <input
              type="text"
              placeholder={"Add Location"}
              value={location}
              onChange={handleLocationChange}
              name="caption"
              className="location-input"
            />
          </div>

          {/* <LocationSelection
        isOpen={isMultiSelectPopupOpen}
        onRequestClose={closeMultiSelectPopup}
        options={possibleLocations}
        onSelect={handleMultiSelect}
      /> */}

          {/* <select value={location} onChange={handleLocationChange}>
        <option value="" disabled>Select a location</option>
        {possibleLocations.map((loc) => (
          <option key={loc.id} value={loc.name}>
            {loc.name}
          </option>
        ))}
      </select> */}
  
          <button
            type="submit"
            className="NewPostInput-button"
            value="Submit"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
      </div>
  );
};

/**
 * New Post is a parent component for all input components
 *
 * Proptypes
 * @param {string} defaultText is the placeholder text
 * @param {string} storyId optional prop, used for comments
 * @param {({storyId, value}) => void} onSubmit: (function) triggered when this post is submitted, takes {storyId, value} as parameters
 * @param {string} storyId to add comment to
 */
const NewComment = (props) => {
  const [value, setValue] = useState("");

  // called whenever the user types in the new post input box
  const handleChange = (event) => {
    setValue(event.target.value);
  };

  // called when the user hits "Submit" for a new post
  const handleSubmit = (event) => {
    event.preventDefault();
    addComment && addComment(value);
    setValue("");
  };

  const addComment = (value) => {
    const body = { parent: props.storyId, content: value };
    post("/api/comment", body).then((comment) => {
      // display this comment on the screen
      props.addNewComment(comment);
    });
  };

  return (
    <div onSubmit={addComment} className="u-flex">
      <input
        type="text"
        placeholder={"New Comment"}
        value={value}
        onChange={handleChange}
        className="NewPostInput-input"
      />

      <button
        type="submit"
        className="NewPostInput-button u-pointer"
        value="Submit"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export { NewComment, NewStory };
