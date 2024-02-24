import T from 'prop-types';

import useForm from '../../../hooks/useForm';
import { InputFile } from '../../common';
import SelectTags from '../SelectTags';
import { useRef } from 'react';

const validName = ({ name }) => name;
const validPrice = ({ price }) =>
  !Number.isNaN(price) && Number.isFinite(price) && price >= 0;
const validTags = ({ tags }) => !!tags.length;

function NewAdvertForm({ onSubmit, isLoading }) {
  const {
    formValue: advert,
    handleChange,
    handleSubmit,
    validate,
  } = useForm({
    name: '',
    sale: true,
    price: 0,
    tags: [],
  });
  // Managing the input "outside of form", just with a ref, to avoid rerender
  const photoRef = useRef(null);
  const { name, sale, price, tags } = advert;

  const handlePhotoChange = ev => {
    // Store selected file in ref
    photoRef.current = ev.target.files[0];
  };

  return (
    <form
      onSubmit={handleSubmit(advert =>
        // Merge all form data with image from ref
        onSubmit({ ...advert, photo: photoRef.current }),
      )}
    >
      <input name="name" value={name} onChange={handleChange} />
      <input
        type="checkbox"
        name="sale"
        checked={sale}
        onChange={handleChange}
      />
      <input type="number" name="price" value={price} onChange={handleChange} />
      <SelectTags name="tags" value={tags} onChange={handleChange} />
      <InputFile name="photo" onChange={handlePhotoChange} />
      <button
        // button disabled if:
        // empty name
        // not finite number price
        // zero tags selected
        // isLoading
        disabled={!validate(validName, validPrice, validTags, () => !isLoading)}
      >
        Save
      </button>
    </form>
  );
}

NewAdvertForm.propTypes = {
  isLoading: T.bool,
  onSubmit: T.func.isRequired,
};

export default NewAdvertForm;
